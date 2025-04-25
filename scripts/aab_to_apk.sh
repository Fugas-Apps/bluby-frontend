#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

# --- Configuration ---
# Directory where the script itself is located
SCRIPT_DIR=$(dirname "$(realpath "$0")")
# Directory to store bundletool
BUNDLETOOL_DIR="$SCRIPT_DIR/bundletool"
# Directory for temporary build files and final APK
BUILD_DIR="$SCRIPT_DIR/build"
# GitHub API URL for latest bundletool release
BUNDLETOOL_API_URL="https://api.github.com/repos/google/bundletool/releases/latest"
# --- End Configuration ---

# --- Helper Functions ---
log() {
  echo "[INFO] $1"
}

error_exit() {
  echo "[ERROR] $1" >&2
  exit 1
}

# --- Argument Parsing ---
AAB_URL=""
KS_PATH=""
KS_PASS=""
KS_ALIAS=""
KEY_PASS=""

# Simple positional argument parsing
while [[ $# -gt 0 ]]; do
  case $1 in
    --ks)
      KS_PATH="$2"
      shift # past argument
      shift # past value
      ;;
    --ks-pass)
      KS_PASS="$2"
      shift # past argument
      shift # past value
      ;;
    --ks-key-alias)
      KS_ALIAS="$2"
      shift # past argument
      shift # past value
      ;;
    --key-pass)
      KEY_PASS="$2"
      shift # past argument
      shift # past value
      ;;
    -h|--help)
      echo "Usage: $0 <url_to_aab_file> [--ks <path>] [--ks-pass <pass>] [--ks-key-alias <alias>] [--key-pass <pass>]"
      echo ""
      echo "Downloads an AAB, downloads bundletool if needed, and converts it to a universal APK."
      echo ""
      echo "Arguments:"
      echo "  <url_to_aab_file>    Required. URL of the .aab file to download."
      echo ""
      echo "Options for Signing (Required for installation on most devices):"
      echo "  --ks <path>          Path to the Java Keystore (.jks/.keystore) file."
      echo "  --ks-pass <pass>     Password for the keystore."
      echo "  --ks-key-alias <alias> Alias of the key to use."
      echo "  --key-pass <pass>    Password for the key alias (often same as keystore password)."
      echo ""
      echo "Example (Unsigned):"
      echo "  $0 http://example.com/my_app.aab"
      echo ""
      echo "Example (Signed):"
      echo "  $0 http://example.com/my_app.aab --ks ~/.android/debug.keystore --ks-pass android --ks-key-alias androiddebugkey --key-pass android"
      exit 0
      ;;
    *)
      # Assume it's the AAB URL if not already set
      if [ -z "$AAB_URL" ]; then
        AAB_URL="$1"
        shift # past argument
      else
        error_exit "Unknown option: $1. Use -h or --help for usage."
      fi
      ;;
  esac
done


if [ -z "$AAB_URL" ]; then
  error_exit "Usage: $0 <url_to_aab_file> [--ks <path> ...] Use -h or --help for full usage."
fi

# Validate signing arguments - if --ks is given, all others are needed
SIGNING_ARGS=""
if [ -n "$KS_PATH" ]; then
  if [ -z "$KS_PASS" ] || [ -z "$KS_ALIAS" ] || [ -z "$KEY_PASS" ]; then
    error_exit "If --ks is provided, you must also provide --ks-pass, --ks-key-alias, and --key-pass."
  fi
  if [ ! -f "$KS_PATH" ]; then
      error_exit "Keystore file not found at: $KS_PATH"
  fi
  # Format for bundletool: prefix passwords with 'pass:'
  SIGNING_ARGS="--ks=\"$KS_PATH\" --ks-pass=pass:\"$KS_PASS\" --ks-key-alias=\"$KS_ALIAS\" --key-pass=pass:\"$KEY_PASS\""
  log "Signing configured using keystore: $KS_PATH"
else
    log "Warning: No keystore information provided (--ks). The resulting APK will be unsigned and likely uninstallable."
fi


# --- Ensure Directories Exist ---
mkdir -p "$BUNDLETOOL_DIR" "$BUILD_DIR"

# --- Check/Download bundletool ---
BUNDLETOOL_JAR_PATH=$(ls "$BUNDLETOOL_DIR"/bundletool-all-*.jar 2>/dev/null | head -n 1)

if [ -z "$BUNDLETOOL_JAR_PATH" ]; then
  log "Bundletool not found. Downloading latest version..."
  # Fetch release data using curl, extract jar URL using grep and sed
  JAR_DOWNLOAD_URL=$(curl -sSL "$BUNDLETOOL_API_URL" | grep "browser_download_url.*bundletool-all-.*\.jar" | sed -E 's/.*"browser_download_url": ?"([^"]+)".*/\1/')

  if [ -z "$JAR_DOWNLOAD_URL" ]; then
    error_exit "Could not determine bundletool download URL from GitHub API."
  fi

  JAR_FILENAME=$(basename "$JAR_DOWNLOAD_URL")
  DOWNLOAD_TARGET="$BUNDLETOOL_DIR/$JAR_FILENAME"

  log "Downloading bundletool from $JAR_DOWNLOAD_URL to $DOWNLOAD_TARGET..."
  if ! curl -SL -o "$DOWNLOAD_TARGET" "$JAR_DOWNLOAD_URL"; then
      error_exit "Failed to download bundletool."
  fi

  BUNDLETOOL_JAR_PATH="$DOWNLOAD_TARGET"
  log "Bundletool downloaded successfully."
else
  log "Using existing bundletool: $BUNDLETOOL_JAR_PATH"
fi

# --- Download AAB ---
AAB_FILENAME=$(basename "$AAB_URL")
# Sanitize filename slightly (replace potential URL query params, etc.)
AAB_FILENAME_CLEAN=$(echo "$AAB_FILENAME" | sed 's/?.*//')
if [[ "$AAB_FILENAME_CLEAN" != *.aab ]]; then
    AAB_FILENAME_CLEAN="${AAB_FILENAME_CLEAN}.aab" # Ensure .aab extension if missing
fi
DOWNLOADED_AAB_PATH="$BUILD_DIR/$AAB_FILENAME_CLEAN"

log "Downloading AAB from $AAB_URL to $DOWNLOADED_AAB_PATH..."
if ! curl -SL -o "$DOWNLOADED_AAB_PATH" "$AAB_URL"; then
    error_exit "Failed to download AAB file from $AAB_URL."
fi
log "AAB downloaded successfully."

# --- Generate Universal APK ---
APKS_OUTPUT_PATH="$BUILD_DIR/output.apks"
log "Generating universal APK from $DOWNLOADED_AAB_PATH..."

# Check if Java is installed
if ! command -v java &> /dev/null; then
    error_exit "Java is not installed or not found in PATH. Bundletool requires Java to run."
fi

# Construct the command with optional signing arguments
BUNDLETOOL_CMD="java -jar \"$BUNDLETOOL_JAR_PATH\" build-apks --bundle=\"$DOWNLOADED_AAB_PATH\" --output=\"$APKS_OUTPUT_PATH\" --mode=universal $SIGNING_ARGS"
log "Running bundletool: $BUNDLETOOL_CMD" # Be careful logging this if passwords are sensitive

if ! eval $BUNDLETOOL_CMD; then # Use eval to handle quoted arguments correctly
    error_exit "Bundletool failed to generate the APKs archive."
fi
log "APKs archive created at $APKS_OUTPUT_PATH."

# --- Extract Universal APK ---
EXTRACT_DIR="$BUILD_DIR/extracted_apks"
mkdir -p "$EXTRACT_DIR"
log "Extracting universal.apk from $APKS_OUTPUT_PATH..."

# Check if unzip is installed
if ! command -v unzip &> /dev/null; then
    error_exit "'unzip' command not found. Needed to extract the final APK."
fi

if ! unzip -o "$APKS_OUTPUT_PATH" -d "$EXTRACT_DIR" universal.apk; then
    # Check if universal.apk exists in the archive if unzip failed
    if ! unzip -l "$APKS_OUTPUT_PATH" | grep -q "universal.apk"; then
        error_exit "Failed to extract 'universal.apk'. It might not be present in the generated archive $APKS_OUTPUT_PATH."
    else
         error_exit "Failed to extract 'universal.apk' using unzip, even though it seems present in the archive."
    fi
fi

FINAL_APK_NAME="${AAB_FILENAME_CLEAN%.aab}-universal.apk"
FINAL_APK_PATH="$BUILD_DIR/$FINAL_APK_NAME"

if [ -f "$EXTRACT_DIR/universal.apk" ]; then
    mv "$EXTRACT_DIR/universal.apk" "$FINAL_APK_PATH"
    log "Universal APK extracted and moved to $FINAL_APK_PATH"
else
    error_exit "Extraction failed: universal.apk not found in $EXTRACT_DIR after unzip."
fi

# --- Cleanup (Optional - uncomment to enable) ---
# log "Cleaning up intermediate files..."
# rm "$DOWNLOADED_AAB_PATH"
# rm "$APKS_OUTPUT_PATH"
# rm -r "$EXTRACT_DIR"

log "---"
log "✅ Success! Universal APK is ready at: $FINAL_APK_PATH"
if [ -z "$SIGNING_ARGS" ]; then
    log "⚠️ Remember: This APK is unsigned and might not install."
fi
log "---"

exit 0 