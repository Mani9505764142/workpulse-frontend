import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_02MgCUKuF",
      userPoolClientId: "43i5bfd4slkit4k31bvrufgqt",
      loginWith: {
        email: true,
      },
    },
  },
});
