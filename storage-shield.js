(function () {
  const cfg = globalThis.SHIELD_CONFIG;
  if (!cfg) return;

  const lsZero = new Set(cfg.localStorageToZero);
  const lsDelete = new Set(cfg.localStorageToDelete);
  const ssDelete = new Set(cfg.sessionStorageToDelete);
  const cZero = new Set(cfg.cookiesToZero);
  const cDelete = new Set(cfg.cookiesToDelete);

  const host = (location.hostname || "").toLowerCase();
  let regDomain = null;
  for (const d of cfg.domains) {
    if (host === d || host.endsWith("." + d)) {
      regDomain = d;
      break;
    }
  }

  const TTL = 60 * 60 * 24 * 180;
  const TTL_MS = TTL * 1000;

  function encodeTcfString() {
    const nowDs = BigInt(Math.floor(Date.now() / 100));
    const bits = [];
    function push(value, length) {
      const big = BigInt(value);
      for (let i = length - 1; i >= 0; i--) {
        bits.push(Number((big >> BigInt(i)) & 1n));
      }
    }
    function pushChar(c) {
      push(c.charCodeAt(0) - 65, 6);
    }
    push(2, 6);
    push(nowDs, 36);
    push(nowDs, 36);
    push(6, 12);
    push(1, 12);
    push(1, 6);
    pushChar("E");
    pushChar("N");
    push(159, 12);
    push(5, 6);
    push(1, 1);
    push(0, 1);
    push(0, 12);
    push(0, 24);
    push(0, 24);
    push(0, 1);
    pushChar("N");
    pushChar("O");
    push(0, 16);
    push(0, 1);
    push(0, 16);
    push(0, 1);
    push(0, 12);
    while (bits.length % 8) bits.push(0);
    const bytes = new Uint8Array(bits.length / 8);
    for (let i = 0; i < bytes.length; i++) {
      let b = 0;
      for (let j = 0; j < 8; j++) b = (b << 1) | bits[i * 8 + j];
      bytes[i] = b;
    }
    let s = "";
    for (const byte of bytes) s += String.fromCharCode(byte);
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function zeroCookieString(name) {
    let s = `${name}=0; Path=/; Max-Age=${TTL}; SameSite=Lax`;
    if (regDomain) s += `; Domain=.${regDomain}`;
    return s;
  }

  function rawSetCookie(value) {
    try {
      const desc = Object.getOwnPropertyDescriptor(Document.prototype, "cookie");
      if (desc && desc.set) desc.set.call(document, value);
      else document.cookie = value;
    } catch (_) {}
  }

  for (const name of cZero) rawSetCookie(zeroCookieString(name));
  for (const name of cDelete) {
    rawSetCookie(`${name}=; Path=/; Max-Age=0`);
    if (regDomain) {
      rawSetCookie(`${name}=; Path=/; Max-Age=0; Domain=.${regDomain}`);
      rawSetCookie(`${name}=; Path=/; Max-Age=0; Domain=${regDomain}`);
    }
  }

  function injectSourcepointConsent() {
    const propertyId = cfg.sourcepointPropertyByDomain[regDomain];
    if (!propertyId) return false;
    const tpl = cfg.sourcepointTemplates[propertyId];
    if (!tpl) return false;

    const userKey = `_sp_user_consent_${propertyId}`;
    let needsInject = true;
    const existing = localStorage.getItem(userKey);
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        const cs = parsed?.gdpr?.consentStatus;
        const exp = parsed?.gdpr?.expirationDate;
        const stillFresh =
          exp && new Date(exp).getTime() > Date.now() + 86400000;
        const isOurReject =
          cs && cs.rejectedAny === true && cs.consentedAll === false;
        if (stillFresh && isOurReject) needsInject = false;
      } catch (_) {}
    }
    if (!needsInject) return false;

    const uuid =
      (crypto && crypto.randomUUID && crypto.randomUUID()) ||
      "00000000-0000-4000-8000-000000000000";
    const fullUuid = `${uuid}_56`;
    const now = new Date();
    const exp = new Date(now.getTime() + TTL_MS);
    const tcString = encodeTcfString();

    const userConsent = {
      gdpr: {
        authId: null,
        uuid: fullUuid,
        getMessageAlways: false,
        applies: true,
        actions: [],
        euconsent: tcString,
        grants: {},
        addtlConsent: "2~~dv.",
        customVendorsResponse: {
          consentedVendors: [],
          consentedPurposes: [],
          legIntPurposes: [],
        },
        dateCreated: now.toISOString(),
        expirationDate: exp.toISOString(),
        consentStatus: {
          rejectedAny: true,
          rejectedLI: false,
          consentedAll: false,
          granularStatus: {
            vendorConsent: "NONE",
            vendorLegInt: "EMPTY_VL",
            purposeConsent: "NONE",
            purposeLegInt: "EMPTY_VL",
            previousOptInAll: false,
            defaultConsent: false,
          },
          hasConsentData: true,
          consentedToAny: true,
        },
        specialFeatures: [],
        legIntCategories: [],
        legIntVendors: [],
        vendors: [],
        categories: [],
        euconsentWithDisclosedVendors: tcString,
      },
      version: 1,
    };

    const localState = {
      gdpr: {
        mmsCookies: tpl.ssCookie ? [tpl.ssCookie] : [],
        propertyId,
        messageId: tpl.messageId,
      },
      custom: { mmsCookies: [], propertyId },
    };

    const nonKeyed = {
      gdpr: { _sp_v1_data: tpl.v1Data, _sp_v1_p: tpl.v1P },
      custom: {},
    };

    try {
      localStorage.setItem(userKey, JSON.stringify(userConsent));
      localStorage.setItem("_sp_local_state", JSON.stringify(localState));
      localStorage.setItem(
        "_sp_non_keyed_local_state",
        JSON.stringify(nonKeyed),
      );
    } catch (_) {}

    rawSetCookie(
      `consentUUID=${fullUuid}; Path=/; Max-Age=${TTL}; SameSite=Lax` +
        (regDomain ? `; Domain=.${regDomain}` : ""),
    );
    rawSetCookie(
      `consentDate=${now.toISOString()}; Path=/; Max-Age=${TTL}; SameSite=Lax` +
        (regDomain ? `; Domain=.${regDomain}` : ""),
    );
    rawSetCookie(
      `_sp_su=false; Path=/; Max-Age=${TTL}; SameSite=Lax` +
        (regDomain ? `; Domain=.${regDomain}` : ""),
    );
    return true;
  }

  const injected = injectSourcepointConsent();

  const cookieDesc = Object.getOwnPropertyDescriptor(Document.prototype, "cookie");
  if (cookieDesc && cookieDesc.set && cookieDesc.get) {
    const origSet = cookieDesc.set;
    const origGet = cookieDesc.get;
    Object.defineProperty(Document.prototype, "cookie", {
      configurable: true,
      enumerable: cookieDesc.enumerable,
      get() {
        return origGet.call(this);
      },
      set(value) {
        const m = String(value).match(/^\s*([^=;\s]+)\s*=/);
        if (m) {
          const name = m[1];
          if (cDelete.has(name)) return;
          if (cZero.has(name)) return origSet.call(this, zeroCookieString(name));
        }
        return origSet.call(this, value);
      },
    });
  }

  function cleanup(store, zeroSet, deleteSet) {
    try {
      for (const k of zeroSet) {
        if (store.getItem(k) !== "0") store.setItem(k, "0");
      }
      for (const k of deleteSet) {
        if (store.getItem(k) !== null) store.removeItem(k);
      }
    } catch (_) {}
  }

  cleanup(localStorage, lsZero, lsDelete);
  cleanup(sessionStorage, new Set(), ssDelete);

  const origSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function (key, value) {
    if (this === localStorage) {
      if (lsDelete.has(key)) return;
      if (lsZero.has(key)) return origSetItem.call(this, key, "0");
    } else if (this === sessionStorage) {
      if (ssDelete.has(key)) return;
    }
    return origSetItem.call(this, key, value);
  };

  console.log(
    "[shield/cs] active on",
    host,
    "regDomain:",
    regDomain,
    "consent-injected:",
    injected,
  );

  try {
    delete globalThis.SHIELD_CONFIG;
  } catch (_) {}
})();
