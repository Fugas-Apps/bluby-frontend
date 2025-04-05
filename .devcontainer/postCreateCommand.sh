if [ -f ../package.json ]; then
    cd ..
    bun i
    cd -
fi

if [ -f package.json ]; then
    bun i
fi