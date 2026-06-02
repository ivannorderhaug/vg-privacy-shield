const SHIELD_CONFIG = {
  domains: [
    "vg.no",
    "e24.no",
    "aftenposten.no",
    "bt.no",
    "aftenbladet.no",
    "aftonbladet.se",
    "svd.se",
  ],

  cookiesToZero: [
    "_cmp_advertising",
    "_cmp_marketing",
    "_cmp_analytics",
    "_cmp_personalisation",
  ],

  cookiesToDelete: [
    "_pulse2data",
    "_pulsesession",
    "clientBucket",
  ],

  localStorageToZero: [
    "CMP:advertising",
    "CMP:marketing",
    "CMP:analytics",
    "CMP:personalisation",
  ],

  localStorageToDelete: [
    "_pulse.internal.identity.cis",
  ],

  sessionStorageToDelete: [
    "abTestId",
  ],

  sourcepointPropertyByDomain: {
    "vg.no": 8876,
    "e24.no": 16052,
    "aftenposten.no": 4607,
    "bt.no": 8885,
    "aftenbladet.no": 8886,
    "aftonbladet.se": 4595,
    "svd.se": 8888,
  },

  sourcepointTemplates: {
    8876: {
      messageId: 1485787,
      v1Data: "1289587",
      v1P: "68",
      ssCookie:
        "_sp_v1_ss=1:H4sIAAAAAAAAAItWqo5RKimOUbKKxs_IAzEMamN1YpRSQcy80pwcILsErKC6lpoSSrEA-EAOLpYAAAA%3D",
    },
    16052: {
      messageId: 1486133,
      v1Data: "1289985",
      v1P: "280",
      ssCookie:
        "_sp_v1_ss=1:H4sIAAAAAAAAAItWqo5RKimOUbKKxs_IAzEMamN1YpRSQcy80pwcILsErKC6lpoSSrEA-EAOLpYAAAA%3D",
    },
    4607: {
      messageId: 1486131,
      v1Data: "1289981",
      v1P: "825",
      ssCookie:
        "_sp_v1_ss=1:H4sIAAAAAAAAAItWqo5RKimOUbKKxs_IAzEMamN1YpRSQcy80pwcILsErKC6lpoSSrEA-EAOLpYAAAA%3D",
    },
    8885: {
      messageId: 1486132,
      v1Data: "1289983",
      v1P: "525",
      ssCookie:
        "_sp_v1_ss=1:H4sIAAAAAAAAAItWqo5RKimOUbKKxs_IAzEMamN1YpRSQcy80pwcILsErKC6lpoSSrEA-EAOLpYAAAA%3D",
    },
    8886: {
      messageId: 1486130,
      v1Data: "1289979",
      v1P: "915",
      ssCookie:
        "_sp_v1_ss=1:H4sIAAAAAAAAAItWqo5RKimOUbKKxs_IAzEMamN1YpRSQcy80pwcILsErKC6lpoSSrEA-EAOLpYAAAA%3D",
    },
    4595: {
      messageId: 1484555,
      v1Data: "1288229",
      v1P: "459",
      ssCookie:
        "_sp_v1_ss=1:H4sIAAAAAAAAAItWqo5RKimOUbKKxs_IAzEMamN1YpRSQcy80pwcILsErKC6lpoSSrEA-EAOLpYAAAA%3D",
    },
    8888: {
      messageId: 1484558,
      v1Data: "1288235",
      v1P: "48",
      ssCookie:
        "_sp_v1_ss=1:H4sIAAAAAAAAAItWqo5RKimOUbKKxs_IAzEMamN1YpRSQcy80pwcILsErKC6lpoSSrEA-EAOLpYAAAA%3D",
    },
  },
};

globalThis.SHIELD_CONFIG = SHIELD_CONFIG;
