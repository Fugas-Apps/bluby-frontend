export interface ProfileDetails {
  user_id: number;
  username: string;
  bio: string;
  private: boolean;
  allow_contact_search: boolean;
}

export interface ProfileUpdate {
  bio?: {
    value: string;
  };
  private?: boolean;
  allow_contact_search?: boolean;
}

export interface SuccessResponseProfileDetails {
  status: 'success';
  body: ProfileDetails;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}
