const statusEl = document.getElementById("status");
const btn = document.getElementById("refresh");

function setStatus(text, cls) {
  statusEl.textContent = text;
  statusEl.className = "status" + (cls ? " " + cls : "");
}

function findRegDomain(host) {
  host = host.toLowerCase();
  for (const d of SHIELD_CONFIG.domains) {
    if (host === d || host.endsWith("." + d)) return d;
  }
  return null;
}

async function refresh(tab, regDomain) {
  const cookieNames = new Set([
    ...SHIELD_CONFIG.cookiesToZero,
    ...SHIELD_CONFIG.cookiesToDelete,
    "consentUUID",
    "consentDate",
    "_sp_su",
  ]);

  const cookies = await chrome.cookies.getAll({ domain: regDomain });
  for (const c of cookies) {
    const isSp = c.name.startsWith("_sp_") || c.name.startsWith("euconsent");
    if (!cookieNames.has(c.name) && !isSp) continue;
    const details = {
      url: `https://${c.domain.replace(/^\./, "")}${c.path || "/"}`,
      name: c.name,
    };
    if (c.storeId) details.storeId = c.storeId;
    if (c.firstPartyDomain !== undefined && c.firstPartyDomain !== "") {
      details.firstPartyDomain = c.firstPartyDomain;
    }
    if (c.partitionKey) details.partitionKey = c.partitionKey;
    try {
      await chrome.cookies.remove(details);
    } catch (_) {}
  }

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    world: "MAIN",
    func: () => {
      try {
        for (const k of Object.keys(localStorage)) {
          if (
            k.startsWith("_sp_") ||
            k.startsWith("CMP:") ||
            k.startsWith("_pulse") ||
            k === "abTestId" ||
            k.startsWith("euconsent")
          ) {
            localStorage.removeItem(k);
          }
        }
      } catch (_) {}
      try {
        for (const k of Object.keys(sessionStorage)) {
          if (k === "abTestId" || k.startsWith("_pulse")) {
            sessionStorage.removeItem(k);
          }
        }
      } catch (_) {}
    },
  });

  await chrome.tabs.reload(tab.id);
  window.close();
}

async function init() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (!tab || !tab.url) {
    setStatus("Ingen aktiv fane", "inactive");
    return;
  }
  let host;
  try {
    host = new URL(tab.url).hostname;
  } catch (_) {
    setStatus("Ikke en nettside", "inactive");
    return;
  }
  const regDomain = findRegDomain(host);
  if (!regDomain) {
    setStatus(`Ikke aktiv på ${host}`, "inactive");
    return;
  }
  setStatus(`Aktiv på ${host}`, "active");
  btn.disabled = false;
  btn.addEventListener("click", async () => {
    btn.disabled = true;
    btn.textContent = "Oppdaterer…";
    try {
      await refresh(tab, regDomain);
    } catch (e) {
      console.error(e);
      btn.textContent = "Oppdater";
      btn.disabled = false;
      setStatus("Feil — se konsollen", "error");
    }
  });
}

init();
