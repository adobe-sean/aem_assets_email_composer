/**
 * Email Composer POC – AEM Micro-Frontend Asset Selector integration
 * Uses PureJSSelectors (UMD) from Adobe CDN.
 */

const STORAGE_KEY = 'aem-asset-selector-config';
const RENDITION_LINK = 'http://ns.adobe.com/adobecloud/rel/rendition';

let imsInstance = null;
let assetSelectorRendered = false;

function getConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveConfig(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getImsPropsFromConfig(config, options = {}) {
  return {
    imsClientId: config.imsClientId || '',
    imsScope: config.imsScope || 'AdobeID,openid,additional_info.projectedProductContext,read_organizations',
    redirectUrl: config.redirectUrl || window.location.href,
    modalMode: options.inPopup ? false : true,
    onImsServiceInitialized: (service) => console.log('IMS initialized', service),
    onAccessTokenReceived: (token) => console.log('Access token received'),
    onAccessTokenExpired: () => console.warn('Access token expired'),
    onErrorReceived: (type, msg) => console.error('IMS error', type, msg),
  };
}

function registerImsAuth(config, options = {}) {
  if (typeof PureJSSelectors === 'undefined') {
    console.error('PureJSSelectors not loaded. Asset Selector script may have failed.');
    return null;
  }
  const imsProps = getImsPropsFromConfig(config, options);
  imsInstance = PureJSSelectors.registerAssetsSelectorsAuthService(imsProps);
  return imsInstance;
}

// When this page loads in a popup (IMS OAuth flow), we only run IMS registration.
// If URL has no callback params yet, call signIn() to redirect this window to Adobe sign-in.
// After sign-in, Adobe redirects back here with token; we register again and the library processes it and closes the popup.
function isImsCallbackUrl() {
  const h = window.location.hash || '';
  const q = window.location.search || '';
  return /access_token|code=|error=/.test(h + q);
}

if (window.opener) {
  const app = document.getElementById('app');
  if (app) app.style.display = 'none';
  const isCallback = isImsCallbackUrl();
  document.body.innerHTML = '<p style="padding:2rem;font-family:system-ui;text-align:center;">' + (isCallback ? 'Completing sign-in…' : 'Redirecting to sign-in…') + '</p>';
  const config = getConfig();
  if (config && config.imsClientId && config.imsOrg && typeof PureJSSelectors !== 'undefined') {
    const service = registerImsAuth(config, { inPopup: true });
    if (!isCallback && service && typeof service.signIn === 'function') {
      service.signIn();
    }
  }
} else {
  // Main window: run the full app below.
}

// DOM (only used when not in popup; refs are safe either way)
const configBtn = document.getElementById('config-btn');
const configPanel = document.getElementById('config-panel');
const configForm = document.getElementById('config-form');
const configClose = document.getElementById('config-close');
const insertImageBtn = document.getElementById('insert-image-btn');
const bodyEditor = document.getElementById('body');
const assetSelectorContainer = document.getElementById('asset-selector');
const assetSelectorDialog = document.getElementById('asset-selector-dialog');

/** Get the first usable image URL from a selected asset (rendition or self link). */
function getAssetImageUrl(asset) {
  const links = asset && asset._links;
  if (!links) return null;

  const renditions = links[RENDITION_LINK];
  if (Array.isArray(renditions) && renditions.length > 0) {
    const href = renditions[0].href;
    if (href) return href;
  }

  // Fallback: check for other common link keys (e.g. content or self)
  const self = links['self'] || links['http://ns.adobe.com/adobecloud/rel/asset'];
  if (self && (Array.isArray(self) ? self[0]?.href : self.href))
    return Array.isArray(self) ? self[0].href : self.href;

  return null;
}

function insertImageIntoBody(url, alt = 'AEM asset') {
  if (!bodyEditor) return;
  const img = document.createElement('img');
  img.src = url;
  img.alt = alt;
  img.loading = 'lazy';
  bodyEditor.focus();
  document.execCommand('insertHTML', false, img.outerHTML);
}

function onAssetSelectorClose() {
  assetSelectorDialog.close();
}

function handleSelection(assets) {
  if (!Array.isArray(assets) || assets.length === 0) {
    onAssetSelectorClose();
    return;
  }
  const asset = assets[0];
  const url = getAssetImageUrl(asset);
  const name = (asset && (asset['repo:name'] || asset['dc:title'])) || 'Image';
  if (url) {
    insertImageIntoBody(url, name);
  } else {
    console.warn('Selected asset has no usable image URL:', asset);
  }
  onAssetSelectorClose();
}

function openAssetSelector() {
  const config = getConfig();
  if (!config || !config.imsClientId || !config.imsOrg) {
    alert('Please configure IMS Client ID and IMS Org first (Config button).');
    configPanel.hidden = false;
    return;
  }

  if (typeof PureJSSelectors === 'undefined') {
    alert('Asset Selector script did not load. Check the browser console.');
    return;
  }

  // Ensure IMS is registered with current config (in case user just saved)
  registerImsAuth(config);

  const assetSelectorProps = {
    imsOrg: config.imsOrg,
    onClose: onAssetSelectorClose,
    handleSelection,
    selectionType: 'single',
    filterFormProps: { 'dc:format': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] },
    repositoryId: config.repositoryId || undefined,
    disableTracking: true,
  };

  // Clear container so we re-mount (Asset Selector may not support reuse)
  assetSelectorContainer.innerHTML = '';

  PureJSSelectors.renderAssetSelectorWithAuthFlow(
    assetSelectorContainer,
    assetSelectorProps,
    () => {
      assetSelectorDialog.showModal();
      assetSelectorRendered = true;
    }
  );
}

function bindConfigForm() {
  const config = getConfig();
  if (config) {
    document.getElementById('imsClientId').value = config.imsClientId || '';
    document.getElementById('imsScope').value = config.imsScope || 'AdobeID,openid,additional_info.projectedProductContext,read_organizations';
    document.getElementById('imsOrg').value = config.imsOrg || '';
    document.getElementById('redirectUrl').value = config.redirectUrl || '';
    document.getElementById('repositoryId').value = config.repositoryId || '';
  }
}

function init() {
  const config = getConfig();
  if (config && config.imsClientId && config.imsOrg) {
    registerImsAuth(config);
  }

  configBtn.addEventListener('click', () => {
    configPanel.hidden = !configPanel.hidden;
    if (!configPanel.hidden) bindConfigForm();
  });

  configClose.addEventListener('click', () => {
    configPanel.hidden = true;
  });

  configForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      imsClientId: document.getElementById('imsClientId').value.trim(),
      imsScope: document.getElementById('imsScope').value.trim(),
      imsOrg: document.getElementById('imsOrg').value.trim(),
      redirectUrl: document.getElementById('redirectUrl').value.trim() || window.location.href,
      repositoryId: document.getElementById('repositoryId').value.trim() || '',
    };
    saveConfig(data);
    registerImsAuth(data);
    configPanel.hidden = true;
    alert('Configuration saved.');
  });

  insertImageBtn.addEventListener('click', openAssetSelector);

  assetSelectorDialog.addEventListener('close', () => {
    assetSelectorRendered = false;
  });
}

if (!window.opener) {
  init();
}
