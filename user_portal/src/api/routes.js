export const API_ROUTES = {
  AUTH: {
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
  },
  CANDIDATE: {
    SAVE_STEP: '/candidate/save-wizard-step',
    FINALIZE: '/candidate/finalize',
    PROFILE: (id) => `/candidate/profile/${id}`,
  },
  EMPLOYER: {
    SIGNUP: '/employer/signup',
    LOGIN: '/employer/login',
    JOBS: '/employer/jobs',
    ORDERS: (id) => `/employer/orders/${id}`,
    ORDER_BY_ID: (id) => `/employer/orders/${id}`,
    PROFILE: '/employer/profile',
  },
};
