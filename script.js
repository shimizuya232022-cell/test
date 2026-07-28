// ============================================================
// 設定：お店の情報や商品はここを編集してください
// ============================================================
const CONFIG = {
  shopName: "丸共　清水屋川魚店",
  shopContact: "お問い合わせ：0120-174-338",
  // Google Apps Script を「ウェブアプリ」として公開した後に発行される URL を貼り付けてください
  // 例: https://script.google.com/macros/s/xxxxxxxxxxxxxxxx/exec
  gasEndpoint: "https://script.google.com/macros/s/AKfycbzqKF3FHfBLJhxLxItNJqxB7_AWzMWZTgqS63z5WSCej2biaxM4FoAc7Tkdyu0gtY-NpQ/exec",
  // 注文可能な最短日（0=当日可, 1=翌日以降のみ）
  minDaysAhead: 1,

  // 定休日（曜日指定）だが特別に営業する日（"YYYY-MM-DD"）。
  // 店頭受け取りはその日自体、配送はその日を発送日とみなすため翌日の着荷が可能になります。
  specialOpenDates: [
    // "2026-08-05",
  ],

  // --- 定休日・臨時休業（店頭受け取り・配送で共有） ---
  // 定休日（水曜）。店頭受け取りはその日自体が不可、配送はその翌日の着荷が不可になります
  // （着日の前日に発送するため。0=日, 1=月, 2=火, 3=水, 4=木, 5=金, 6=土）
  pickupClosedWeekdays: [3],
  // 臨時休業の個別の日付（"YYYY-MM-DD"）。店頭受け取りはその日自体が不可、配送はその翌日の着荷が不可になります
  pickupUnavailableDates: [
    "2026-07-28",
  ],

  // 店頭受け取りの時間帯（営業時間 9:00〜18:00、受け取りは10:00〜17:45の間で30分刻み）
  pickupTimeStart: "10:00",
  pickupTimeEnd: "17:45",
  pickupTimeStepMinutes: 30,

  // うなぎ商品（人前選択商品）の、日ごとの人前数上限（管理画面「うなぎ管理」タブで編集、店頭受け取り・配送で共有）。
  // GASから取得できた場合はこちらの初期値は無視されます。unagiDailyCapacity[日付（仕込み日）][商品ID] = 上限人前数
  unagiDailyCapacity: {
    // "2026-08-05": { "p17851553987067": 20 },
  },

  // クール便のお届け希望時間の選択肢（管理画面「クール便」タブで編集）
  shippingTimeSlots: ["午前中（8:00〜12:00）", "14:00〜16:00", "16:00〜18:00", "18:00〜20:00", "19:00〜21:00"],

  // 配送時の送料（地方区分ごと。管理画面「クール便」タブで編集）
  shippingFeeByRegion: {
    "北海道": 1500, "東北": 900, "関東": 700, "中部": 700, "関西": 700,
    "中国": 800, "四国": 800, "九州": 900, "沖縄": 1800,
  },
};

// availableFor: この商品を注文できる受け取り方法（"pickup" 店頭受け取り / "shipping" 配送）
// maxServings: 設定すると「〇人前」を選んで複数追加する形式になる（省略/nullなら通常の数量選択）
// ※ GAS管理画面「商品」タブで商品を管理している場合、起動時にそちらの内容へ丸ごと差し替わります。
//   この配列はGASに接続できない場合のフォールバック（例示）です。
let PRODUCTS = [
  // 「〇人前」選択商品（価格は1人前あたり）
  // 等級（並/特上/真空並/真空特上）は商品名から自動判定します（getProductGrade参照）。管理画面では変更できません
  { id: "p17851553987067", name: "うなぎ蒲焼(並)", price: 2000, availableFor: ["pickup", "shipping"], maxServings: 6 },
  { id: "p1785155451439806", name: "うなぎ蒲焼(特上)", price: 2700, availableFor: ["pickup", "shipping"], maxServings: 4 },
  { id: "p1785155489646581", name: "うなぎ白焼き(並)", price: 1900, availableFor: ["pickup", "shipping"], maxServings: 6 },
  { id: "p1785155523456183", name: "うなぎ白焼き(特上)", price: 2600, availableFor: ["pickup", "shipping"], maxServings: 4 },
  { id: "p1785155560863159", name: "うなぎ蒲焼(並)真空パック", price: 2020, availableFor: ["pickup", "shipping"], maxServings: 5 },
  { id: "p1785155699915863", name: "うなぎ蒲焼(特上)真空パック", price: 2720, availableFor: ["pickup", "shipping"], maxServings: 4 },
  { id: "p1785155734555807", name: "うなぎ白焼き(並)真空パック", price: 1920, availableFor: ["pickup", "shipping"], maxServings: 5 },
  { id: "p1785155784538956", name: "うなぎ白焼き(特上)真空パック", price: 2620, availableFor: ["pickup", "shipping"], maxServings: 4 },
  // 通常の数量選択商品
  { id: "p1", name: "肝焼き", price: 1100, availableFor: ["pickup", "shipping"] },
  { id: "p2", name: "肝焼き(ハーフ)", price: 600, availableFor: ["pickup", "shipping"] },
  { id: "p1785156001465926", name: "わかさぎ唐揚げ(タレ)", price: 1100, availableFor: ["pickup", "shipping"] },
  { id: "p1785156199020779", name: "わかさぎ唐揚げ(タレ)(ハーフ)", price: 550, availableFor: ["pickup", "shipping"] },
  { id: "p1785156245865697", name: "わかさぎ唐揚げ(塩)", price: 1100, availableFor: ["pickup", "shipping"] },
  { id: "p1785156380961901", name: "わかさぎ唐揚げ(塩)(ハーフ)", price: 550, availableFor: ["pickup", "shipping"] },
  { id: "p1785156413497579", name: "わかさぎ唐揚げ(カレー)(ハーフ)", price: 550, availableFor: ["pickup", "shipping"] },
  { id: "p1785156431134227", name: "わかさぎ唐揚げ(ピリ辛)(ハーフ)", price: 550, availableFor: ["pickup", "shipping"] },
];

// 都道府県 → 地方区分
const PREFECTURE_REGION = {
  "北海道": "北海道",
  "青森県": "東北", "岩手県": "東北", "宮城県": "東北", "秋田県": "東北", "山形県": "東北", "福島県": "東北",
  "茨城県": "関東", "栃木県": "関東", "群馬県": "関東", "埼玉県": "関東", "千葉県": "関東", "東京都": "関東", "神奈川県": "関東",
  "新潟県": "中部", "富山県": "中部", "石川県": "中部", "福井県": "中部", "山梨県": "中部", "長野県": "中部", "岐阜県": "中部", "静岡県": "中部", "愛知県": "中部",
  "三重県": "関西", "滋賀県": "関西", "京都府": "関西", "大阪府": "関西", "兵庫県": "関西", "奈良県": "関西", "和歌山県": "関西",
  "鳥取県": "中国", "島根県": "中国", "岡山県": "中国", "広島県": "中国", "山口県": "中国",
  "徳島県": "四国", "香川県": "四国", "愛媛県": "四国", "高知県": "四国",
  "福岡県": "九州", "佐賀県": "九州", "長崎県": "九州", "熊本県": "九州", "大分県": "九州", "宮崎県": "九州", "鹿児島県": "九州",
  "沖縄県": "沖縄",
};

// ============================================================

// 店頭受け取り: home(自宅用) / gift(お土産用) を別々に集計。配送: ship のみ使用。
let quantities = {};
// 人前選択商品（maxServings設定あり）の追加済みライン一覧。商品ID: [{ id, servings, count, purpose }]
// servings=〇人前、count=その〇人前パックの個数。purpose は店頭受け取りのみ "home"/"gift"、配送時は null。
let servingLines = {};
// 人前選択商品で「追加」ボタンを押す前の、個数ステッパーの一時的な選択値（商品ID: 個数）
let servingPendingCount = {};
function initQuantities() {
  quantities = {};
  servingLines = {};
  servingPendingCount = {};
  PRODUCTS.forEach((p) => {
    quantities[p.id] = { home: 0, gift: 0, ship: 0 };
    servingLines[p.id] = [];
    servingPendingCount[p.id] = 1;
  });
}
initQuantities();

// 選択中の受け取り日時における、上限商品の残数（商品ID: 残数）。未取得の商品は含まれない。
let stockRemaining = {};

function findProduct(productId) {
  return PRODUCTS.find((p) => p.id === productId);
}

// maxServings が設定されている商品は「〇人前」を選んで複数追加する形式になる
function isServingBased(product) {
  return !!product && product.maxServings !== undefined && product.maxServings !== null;
}

// 人前選択商品の等級を商品名から自動判定する（並/特上/真空並/真空特上）。等級は変更されない前提のため、
// 管理画面では編集させず、商品名に含まれる「真空」「特上」の有無だけで判定する。
function getProductGrade(product) {
  const name = (product && product.name) || "";
  const isVac = name.includes("真空");
  const isTokujo = name.includes("特上");
  if (isVac && isTokujo) return "tokujoVac";
  if (isVac) return "namiVac";
  if (isTokujo) return "tokujo";
  return "nami";
}

function makeServingLineId() {
  return "sl" + Date.now() + Math.floor(Math.random() * 1000);
}

// 指定商品・仕込み日（店頭受け取りはその受け取り日、配送は出荷日）の有効な上限人前数を返す。上限がなければ null。
function getUnagiDailyLimit(productId, prepDateStr) {
  const byDate = CONFIG.unagiDailyCapacity[prepDateStr];
  if (byDate && Object.prototype.hasOwnProperty.call(byDate, productId)) {
    return byDate[productId];
  }
  return null;
}

const productListEl = document.getElementById("productList");
const totalPriceEl = document.getElementById("totalPrice");
const form = document.getElementById("orderForm");
const formErrorEl = document.getElementById("formError");
const submitBtn = document.getElementById("submitBtn");
const successMessageEl = document.getElementById("successMessage");
const shippingFieldsEl = document.getElementById("shippingFields");
const pickupNoteEl = document.getElementById("pickupNote");
const desiredDateInput = document.getElementById("desiredDate");
const desiredDateDisplayBtn = document.getElementById("desiredDateDisplay");
const calendarPopupEl = document.getElementById("calendarPopup");
const calMonthLabelEl = document.getElementById("calMonthLabel");
const calPrevMonthBtn = document.getElementById("calPrevMonth");
const calNextMonthBtn = document.getElementById("calNextMonth");
const calendarGridEl = document.getElementById("calendarGrid");
const desiredTimePickupSlotEl = document.getElementById("desiredTimePickupSlot");
const desiredTimeSlotEl = document.getElementById("desiredTimeSlot");
const timeSlotHintEl = document.getElementById("timeSlotHint");
const pickupTimeHintEl = document.getElementById("pickupTimeHint");
const dateHintEl = document.getElementById("dateHint");
const dateAvailabilityErrorEl = document.getElementById("dateAvailabilityError");
const zipInput = document.getElementById("zip");
const zipLookupBtn = document.getElementById("zipLookupBtn");
const zipHintEl = document.getElementById("zipHint");
const addressInput = document.getElementById("address");
const shippingFeeRowEl = document.getElementById("shippingFeeRow");
const shippingFeeAmountEl = document.getElementById("shippingFeeAmount");
const paymentHintEl = document.getElementById("paymentHint");
const invoiceDifferentInput = document.getElementById("invoiceDifferent");
const invoiceFieldsEl = document.getElementById("invoiceFields");
const invoiceRecipientNameInput = document.getElementById("invoiceRecipientName");
const invoiceZipInput = document.getElementById("invoiceZip");
const invoiceZipLookupBtn = document.getElementById("invoiceZipLookupBtn");
const invoiceZipHintEl = document.getElementById("invoiceZipHint");
const invoiceAddressInput = document.getElementById("invoiceAddress");
const invoiceAddressBuildingInput = document.getElementById("invoiceAddressBuilding");
const editModeBannerEl = document.getElementById("editModeBanner");
const successTitleEl = document.getElementById("successTitle");
const successBodyEl = document.getElementById("successBody");

let calendarViewDate = new Date();
let selectedDateStr = null;
// URLの ?orderId= から編集対象を復元した場合にセットされる（新規注文なら null のまま）
let editingOrderId = null;

// 店舗名・お問い合わせ表示は管理画面「店舗情報」タブで編集されるため、起動時に取得してCONFIGへ反映する。
// 通知先メールや振込先など非公開の情報は含まれない（?action=shopInfo は公開エンドポイントのため）。
async function fetchRemoteShopInfo() {
  if (!CONFIG.gasEndpoint || CONFIG.gasEndpoint === "GAS_WEB_APP_URL_HERE") return;
  try {
    const res = await fetch(`${CONFIG.gasEndpoint}?action=shopInfo`);
    const data = await res.json();
    if (!data || !data.success) return;
    if (typeof data.shopName === "string" && data.shopName) CONFIG.shopName = data.shopName;
    if (typeof data.shopContact === "string" && data.shopContact) CONFIG.shopContact = data.shopContact;
  } catch (err) {
    // 取得に失敗した場合は script.js 内の初期値のまま動作する
  }
}

// 休み・臨時営業日・発送不可日・うなぎ商品の日別上限は管理画面（GAS）側で編集されるため、
// 起動時に最新の設定を取得してCONFIGへ反映する。取得できない場合は script.js 内の初期値のまま動作する。
async function fetchRemoteSettings() {
  if (!CONFIG.gasEndpoint || CONFIG.gasEndpoint === "GAS_WEB_APP_URL_HERE") return;
  try {
    const res = await fetch(`${CONFIG.gasEndpoint}?action=settings`);
    const data = await res.json();
    if (!data || !data.success || !data.settings) return;
    const s = data.settings;
    if (Array.isArray(s.pickupClosedWeekdays)) CONFIG.pickupClosedWeekdays = s.pickupClosedWeekdays;
    if (Array.isArray(s.pickupUnavailableDates)) CONFIG.pickupUnavailableDates = s.pickupUnavailableDates;
    if (Array.isArray(s.specialOpenDates)) CONFIG.specialOpenDates = s.specialOpenDates;
    if (s.unagiDailyCapacity && typeof s.unagiDailyCapacity === "object") {
      CONFIG.unagiDailyCapacity = s.unagiDailyCapacity;
    }
    if (Array.isArray(s.shippingTimeSlots) && s.shippingTimeSlots.length > 0) {
      CONFIG.shippingTimeSlots = s.shippingTimeSlots;
    }
    if (s.shippingFeeByRegion && typeof s.shippingFeeByRegion === "object") {
      CONFIG.shippingFeeByRegion = s.shippingFeeByRegion;
    }
  } catch (err) {
    // 取得に失敗した場合は script.js 内の初期値のまま動作する
  }
}

// 商品（名前・価格・上限数）は管理画面「商品」タブで編集されるため、
// 起動時に最新の一覧を取得して PRODUCTS を丸ごと差し替える。取得できない場合は script.js 内の初期値のまま動作する。
async function fetchRemoteProducts() {
  if (!CONFIG.gasEndpoint || CONFIG.gasEndpoint === "GAS_WEB_APP_URL_HERE") return;
  try {
    const res = await fetch(`${CONFIG.gasEndpoint}?action=products`);
    const data = await res.json();
    if (!data || !data.success || !Array.isArray(data.products) || data.products.length === 0) return;
    PRODUCTS = data.products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      maxServings: p.maxServings,
      // 管理画面では受け取り方法を分けて設定しないため、両方の受け取り方法で注文可能として扱う
      availableFor: ["pickup", "shipping"],
    }));
    // うなぎ管理タブの商品（〇人前選択）を上、商品タブの商品を下に表示する（各グループ内の順序は管理画面での並び順のまま）
    PRODUCTS.sort((a, b) => Number(isServingBased(b)) - Number(isServingBased(a)));
  } catch (err) {
    // 取得に失敗した場合は script.js 内の初期値のまま動作する
  }
}

// 折箱の種類（人前選択商品の折箱オプション。サイズごとに価格・収容人前数上限が異なる）
// ※ GAS管理画面「商品」タブで管理している場合、起動時にそちらの内容へ丸ごと差し替わります。
// capacityNami/capacityTokujo: それぞれの等級で収容できる人前数上限（空欄=null なら何人前でも対応）
// capacityNami/capacityTokujo/capacityNamiVac/capacityTokujoVac: 各等級で収容できる人前数上限（空欄=null なら何人前でも対応）
let BOX_TYPES = [
  { id: "box-nami", name: "並箱", price: 300, capacityNami: 3, capacityTokujo: 2, capacityNamiVac: 3, capacityTokujoVac: 2 },
  { id: "box-dai", name: "大箱", price: 500, capacityNami: 5, capacityTokujo: 4, capacityNamiVac: 5, capacityTokujoVac: 4 },
];

async function fetchRemoteBoxTypes() {
  if (!CONFIG.gasEndpoint || CONFIG.gasEndpoint === "GAS_WEB_APP_URL_HERE") return;
  try {
    const res = await fetch(`${CONFIG.gasEndpoint}?action=boxTypes`);
    const data = await res.json();
    if (!data || !data.success || !Array.isArray(data.boxTypes)) return;
    BOX_TYPES = data.boxTypes;
  } catch (err) {
    // 取得に失敗した場合は script.js 内の初期値のまま動作する
  }
}

function getBoxCapacityKey(grade) {
  return "capacity" + grade.charAt(0).toUpperCase() + grade.slice(1);
}

// 選択された人前数・等級（並/特上/真空並/真空特上）を収容できる折箱のうち、
// 収容人前数上限が一番小さい（＝通常は一番安い）ものを自動選択する
function findAutoBoxForServings(servings, grade) {
  const capacityKey = getBoxCapacityKey(grade);
  const candidates = BOX_TYPES.filter((b) => {
    const capacity = b[capacityKey];
    return capacity === null || capacity === undefined || capacity >= servings;
  });
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => {
    const capA = a[capacityKey] === null || a[capacityKey] === undefined ? Infinity : a[capacityKey];
    const capB = b[capacityKey] === null || b[capacityKey] === undefined ? Infinity : b[capacityKey];
    return capA - capB;
  });
  return candidates[0];
}

// 管理画面「注文」タブの編集リンク（?orderId=...）から開かれた場合、既存の注文内容を取得してフォームに復元する。
// お客様向けにはこのリンクを一切案内していないため、通常の利用では発生しない（お客様は一度送信した注文を変更できない）。
async function fetchOrderForEditing(orderId) {
  if (!CONFIG.gasEndpoint || CONFIG.gasEndpoint === "GAS_WEB_APP_URL_HERE") return;
  try {
    const res = await fetch(`${CONFIG.gasEndpoint}?action=order&orderId=${encodeURIComponent(orderId)}`);
    const data = await res.json();
    if (!data || !data.success || !data.order) {
      showError((data && data.message) || "指定された注文が見つかりませんでした。");
      return;
    }
    applyOrderToForm(data.order);
  } catch (err) {
    showError("注文情報の取得に失敗しました。時間をおいて再度お試しください。");
  }
}

function applyOrderToForm(order) {
  editingOrderId = order.orderId;

  // 受け取り方法を切り替える（changeイベントを発火させ、既存のトグル処理をそのまま利用する）
  const deliveryRadio = document.querySelector(`input[name="deliveryType"][value="${order.deliveryType}"]`);
  if (deliveryRadio) {
    deliveryRadio.checked = true;
    deliveryRadio.dispatchEvent(new Event("change"));
  }

  document.getElementById("customerName").value = order.customerName || "";
  document.getElementById("customerTel").value = order.customerTel || "";
  document.getElementById("customerEmail").value = order.customerEmail || "";
  document.getElementById("notes").value = order.notes || "";

  // 数量を復元（削除済み商品は無視する）
  (order.items || []).forEach((item) => {
    const product = findProduct(item.productId);
    if (!product) return;
    if (isServingBased(product)) {
      const purpose = item.purpose === "自宅用" ? "home" : item.purpose === "お土産用" ? "gift" : null;
      // servings/packCount/boxId等は追加フィールド。旧データ（本機能追加前の注文）には無いため、quantityを人前数・個数1・折箱なしとして扱う
      const servings = item.servings || item.quantity;
      const count = item.packCount || 1;
      const box = item.boxId ? { id: item.boxId, name: item.boxName || "", price: item.boxPrice || 0 } : null;
      if (!servingLines[item.productId]) servingLines[item.productId] = [];
      servingLines[item.productId].push({ id: makeServingLineId(), servings, count, purpose, box });
      return;
    }
    if (!quantities[item.productId]) return;
    const key = item.purpose === "自宅用" ? "home" : item.purpose === "お土産用" ? "gift" : "ship";
    quantities[item.productId][key] += item.quantity;
  });
  renderProducts(order.deliveryType);

  // 日付・時間を復元
  selectedDateStr = order.desiredDate;
  desiredDateInput.value = order.desiredDate;
  desiredDateDisplayBtn.textContent = formatDateForDisplay(order.desiredDate);
  desiredDateDisplayBtn.classList.remove("placeholder");
  if (order.deliveryType === "shipping") {
    desiredTimeSlotEl.value = order.desiredTime;
  } else {
    desiredTimePickupSlotEl.value = order.desiredTime;
  }

  if (order.deliveryType === "shipping") {
    zipInput.value = order.zip || "";
    addressInput.value = order.address || "";
    document.getElementById("addressBuilding").value = order.addressBuilding || "";

    if (order.invoiceDifferent) {
      invoiceDifferentInput.checked = true;
      invoiceFieldsEl.classList.remove("hidden");
      invoiceRecipientNameInput.value = order.invoiceRecipientName || "";
      invoiceZipInput.value = order.invoiceZip || "";
      invoiceAddressInput.value = order.invoiceAddress || "";
      invoiceAddressBuildingInput.value = order.invoiceAddressBuilding || "";
    }
  }

  fetchStockAvailability();
  updateTotal();
  validateDesiredDate();
  clearError();

  submitBtn.textContent = "変更を保存する";
  editModeBannerEl.classList.remove("hidden");
}

async function init() {
  await fetchRemoteShopInfo();
  document.getElementById("shopName").textContent = CONFIG.shopName;
  document.getElementById("shopContact").textContent = CONFIG.shopContact;
  await fetchRemoteSettings();
  await fetchRemoteProducts();
  await fetchRemoteBoxTypes();
  initQuantities();
  renderProducts(getDeliveryType());
  setupDeliveryTypeToggle();
  productListEl.addEventListener("click", handleQtyClick);
  productListEl.addEventListener("click", handleServingLineClick);
  productListEl.addEventListener("change", handleServingSelectChange);
  form.addEventListener("submit", handleSubmit);
  document.getElementById("newOrderBtn").addEventListener("click", resetForm);
  setupZipLookup();
  setupCalendar();
  setupInvoiceToggle();
  populatePickupTimeOptions();
  populateShippingTimeOptions();
  updateDateHint();
  updatePaymentHint();

  const orderIdParam = new URLSearchParams(window.location.search).get("orderId");
  if (orderIdParam) {
    await fetchOrderForEditing(orderIdParam);
  }
}

function setupInvoiceToggle() {
  invoiceDifferentInput.addEventListener("change", () => {
    invoiceFieldsEl.classList.toggle("hidden", !invoiceDifferentInput.checked);
  });
}

function updatePaymentHint() {
  paymentHintEl.textContent =
    getDeliveryType() === "shipping"
      ? "お支払いは銀行振込のみとなります。ご注文後にご請求書をお送りいたします。"
      : "お支払いは店頭にて現金にてお願いいたします。";
}

function setupZipLookup() {
  zipLookupBtn.addEventListener("click", () => lookupAddressByZip(zipInput, addressInput, zipHintEl));
  zipInput.addEventListener("input", () => {
    const digits = zipInput.value.replace(/[^0-9]/g, "");
    if (digits.length === 7) lookupAddressByZip(zipInput, addressInput, zipHintEl);
  });
  addressInput.addEventListener("input", updateTotal);

  invoiceZipLookupBtn.addEventListener("click", () =>
    lookupAddressByZip(invoiceZipInput, invoiceAddressInput, invoiceZipHintEl)
  );
  invoiceZipInput.addEventListener("input", () => {
    const digits = invoiceZipInput.value.replace(/[^0-9]/g, "");
    if (digits.length === 7) lookupAddressByZip(invoiceZipInput, invoiceAddressInput, invoiceZipHintEl);
  });
}

async function lookupAddressByZip(zipEl, addressEl, hintEl) {
  const digits = zipEl.value.replace(/[^0-9]/g, "");
  if (digits.length !== 7) {
    hintEl.textContent = "7桁の郵便番号を入力してください（例: 123-4567）。";
    return;
  }

  hintEl.textContent = "住所を検索中...";
  try {
    const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${digits}`);
    const data = await res.json();
    if (data.status !== 200 || !data.results || data.results.length === 0) {
      hintEl.textContent = "該当する住所が見つかりませんでした。お手数ですが住所を直接入力してください。";
      return;
    }
    const r = data.results[0];
    addressEl.value = `${r.address1}${r.address2}${r.address3}`;
    hintEl.textContent = "";
  } catch (err) {
    hintEl.textContent = "住所の自動取得に失敗しました。お手数ですが住所を直接入力してください。";
  } finally {
    if (zipEl === zipInput) updateTotal();
  }
}

// 住所の先頭付近から都道府県名を検出する
function detectPrefecture(addressText) {
  return Object.keys(PREFECTURE_REGION).find((pref) => addressText.includes(pref)) || null;
}

// 配送時の送料。都道府県が判定できない場合は null を返す
function getShippingFee() {
  if (getDeliveryType() !== "shipping") return 0;
  const pref = detectPrefecture(addressInput.value);
  if (!pref) return null;
  return CONFIG.shippingFeeByRegion[PREFECTURE_REGION[pref]];
}

// 店頭受け取り: 30分刻みの時間帯選択 / 配送: ヤマト運輸クール便の時間帯選択
function getDesiredTime() {
  return getDeliveryType() === "shipping" ? desiredTimeSlotEl.value : desiredTimePickupSlotEl.value;
}

function generatePickupTimeSlots() {
  const [startH, startM] = CONFIG.pickupTimeStart.split(":").map(Number);
  const [endH, endM] = CONFIG.pickupTimeEnd.split(":").map(Number);
  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;
  const step = CONFIG.pickupTimeStepMinutes;

  const slots = [];
  for (let t = startTotal; t < endTotal; t += step) {
    const h = String(Math.floor(t / 60)).padStart(2, "0");
    const m = String(t % 60).padStart(2, "0");
    slots.push(`${h}:${m}`);
  }
  slots.push(CONFIG.pickupTimeEnd); // 終了時刻が刻みに乗らない場合も必ず含める
  return slots;
}

function populatePickupTimeOptions() {
  generatePickupTimeSlots().forEach((time) => {
    const option = document.createElement("option");
    option.value = time;
    option.textContent = time;
    desiredTimePickupSlotEl.appendChild(option);
  });
}

// クール便のお届け希望時間（管理画面「クール便」タブで編集）をプルダウンに反映する
function populateShippingTimeOptions() {
  // 既存の選択肢（プレースホルダー以外）をクリアしてから再構築する（設定取得後に呼ばれるため）
  Array.from(desiredTimeSlotEl.options).forEach((opt) => {
    if (opt.value !== "") desiredTimeSlotEl.removeChild(opt);
  });
  CONFIG.shippingTimeSlots.forEach((time) => {
    const option = document.createElement("option");
    option.value = time;
    option.textContent = time;
    desiredTimeSlotEl.appendChild(option);
  });
}

// YYYY-MM-DD 形式に変換（ローカル日付のまま。toISOString はUTC変換で日付がずれるため使わない）
function formatLocalDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return formatLocalDate(d);
}

// 指定した日付がその受け取り方法で選択可能かどうか
// 定休日・臨時休業は店頭受け取り・配送で共有する設定。配送は発送日（着日の前日）がこれに該当するかで判定する
function isDateAvailable(dateStr, deliveryType) {
  if (!dateStr) return true; // 未入力は別途必須チェックで扱う

  const targetDate = deliveryType === "pickup" ? dateStr : addDays(dateStr, -1);
  const weekday = new Date(`${targetDate}T00:00:00`).getDay();
  const isSpecialOpen = CONFIG.specialOpenDates.includes(targetDate);
  if (!isSpecialOpen && CONFIG.pickupClosedWeekdays.includes(weekday)) return false;
  if (CONFIG.pickupUnavailableDates.includes(targetDate)) return false;
  return true;
}

// その日付が「通常は定休日/臨時休業だが特別営業により利用可能」になっているか
function isSpecialOpenOverride(dateStr, deliveryType) {
  const targetDate = deliveryType === "pickup" ? dateStr : addDays(dateStr, -1);
  if (!CONFIG.specialOpenDates.includes(targetDate)) return false;
  const weekday = new Date(`${targetDate}T00:00:00`).getDay();
  return CONFIG.pickupClosedWeekdays.includes(weekday);
}

function updateDateHint() {
  const deliveryType = getDeliveryType();
  const weekdayNames = ["日", "月", "火", "水", "木", "金", "土"];
  let msg = "ご注文はご希望日の前日までにお願いいたします。";

  if (deliveryType === "pickup") {
    const closedWeekdayLabel = CONFIG.pickupClosedWeekdays.map((d) => `${weekdayNames[d]}曜日`).join("・");
    if (closedWeekdayLabel) msg += ` 受け取り不可日：${closedWeekdayLabel}`;
    if (CONFIG.pickupUnavailableDates.length > 0) {
      msg += `${closedWeekdayLabel ? "、" : " 受け取り不可日："}${CONFIG.pickupUnavailableDates.join("、")}`;
    }
    dateHintEl.textContent = msg;
    return;
  }

  // 配送: 定休日・臨時休業日の翌日を配送休止日として表示する
  const blockedWeekdayLabel = [...new Set(CONFIG.pickupClosedWeekdays.map((d) => (d + 1) % 7))]
    .map((d) => `${weekdayNames[d]}曜日`)
    .join("・");
  const blockedDates = CONFIG.pickupUnavailableDates.map((d) => addDays(d, 1));
  if (blockedWeekdayLabel) msg += ` 配送休止日：${blockedWeekdayLabel}`;
  if (blockedDates.length > 0) {
    msg += `${blockedWeekdayLabel ? "、" : " 配送休止日："}${blockedDates.join("、")}`;
  }

  dateHintEl.textContent = msg;
}

function validateDesiredDate() {
  const deliveryType = getDeliveryType();
  if (!desiredDateInput.value || isDateAvailable(desiredDateInput.value, deliveryType)) {
    dateAvailabilityErrorEl.classList.add("hidden");
    dateAvailabilityErrorEl.textContent = "";
    return true;
  }
  dateAvailabilityErrorEl.textContent =
    deliveryType === "shipping"
      ? "選択された日付は配送を承っておりません。別の日付をお選びください。"
      : "選択された日付は定休日のため店頭受け取りができません。別の日付をお選びください。";
  dateAvailabilityErrorEl.classList.remove("hidden");
  return false;
}

function getSubtotal() {
  const deliveryType = getDeliveryType();
  let subtotal = 0;
  PRODUCTS.forEach((p) => {
    if (!p.availableFor.includes(deliveryType)) return;
    if (isServingBased(p)) {
      (servingLines[p.id] || []).forEach((line) => {
        subtotal += p.price * line.servings * line.count;
        if (line.box) subtotal += line.box.price * line.count;
      });
      return;
    }
    const q = quantities[p.id];
    subtotal += deliveryType === "pickup" ? p.price * (q.home + q.gift) : p.price * q.ship;
  });
  return subtotal;
}

// 人前選択商品の「〇人前」プルダウンの選択肢
function servingSelectOptionsHtml(maxServings) {
  let html = "";
  for (let i = 1; i <= maxServings; i++) {
    html += `<option value="${i}">${i}人前</option>`;
  }
  return html;
}

// 人前選択商品の「個数」ステッパー（〇人前パックをいくつ追加するか）
function servingCountControlHtml(productId) {
  return `
    <div class="serving-count-control">
      <span class="serving-count-caption">個数</span>
      <button type="button" class="serving-count-btn" data-action="decrease" data-id="${productId}" aria-label="個数を減らす">−</button>
      <span class="serving-count-value" id="serving-count-${productId}">1</span>
      <button type="button" class="serving-count-btn" data-action="increase" data-id="${productId}" aria-label="個数を増やす">＋</button>
    </div>
  `;
}

// 人前選択商品の「折箱」チェック欄（折箱代金が設定されている場合のみ表示）
function servingBoxCheckHtml(productId) {
  if (!BOX_TYPES || BOX_TYPES.length === 0) return "";
  return `
    <label class="serving-box-check">
      <input type="checkbox" id="serving-box-${productId}">
      <span id="serving-box-label-${productId}">折箱を使う</span>
    </label>
  `;
}

// 選択中の「〇人前」に応じて自動選択される折箱の名前・価格をチェック欄のラベルに反映する。
// 対応する折箱がない場合はチェック欄を無効化する。
function updateServingBoxLabel(productId) {
  const labelEl = document.getElementById(`serving-box-label-${productId}`);
  const checkboxEl = document.getElementById(`serving-box-${productId}`);
  if (!labelEl || !checkboxEl) return;

  const selectEl = document.getElementById(`serving-select-${productId}`);
  const servings = selectEl ? Number(selectEl.value) || 1 : 1;
  const product = findProduct(productId);
  const box = findAutoBoxForServings(servings, getProductGrade(product));

  if (!box) {
    labelEl.textContent = "折箱を使う（対応する折箱がありません）";
    checkboxEl.checked = false;
    checkboxEl.disabled = true;
    return;
  }
  checkboxEl.disabled = false;
  labelEl.textContent = `折箱を使う（${box.name}：+¥${box.price.toLocaleString()}/個）`;
}

function qtyControlHtml(productId, purpose) {
  return `
    <div class="qty-control">
      <button type="button" class="qty-btn" data-action="decrease" data-id="${productId}" data-purpose="${purpose}" aria-label="数量を減らす">−</button>
      <span class="qty-value" id="qty-${productId}-${purpose}">0</span>
      <button type="button" class="qty-btn" data-action="increase" data-id="${productId}" data-purpose="${purpose}" aria-label="数量を増やす">＋</button>
    </div>
  `;
}

function renderProducts(deliveryType) {
  const visibleProducts = PRODUCTS.filter((p) => p.availableFor.includes(deliveryType));

  // 表示されなくなる商品の数量は0にリセットする
  PRODUCTS.forEach((p) => {
    if (!p.availableFor.includes(deliveryType)) {
      quantities[p.id] = { home: 0, gift: 0, ship: 0 };
      servingLines[p.id] = [];
    }
  });

  productListEl.innerHTML = "";
  visibleProducts.forEach((product) => {
    const row = document.createElement("div");
    const serving = isServingBased(product);

    if (deliveryType === "pickup") {
      row.className = "product-row product-row--split";
      if (serving) {
        row.innerHTML = `
          <div class="product-info">
            <div class="product-name">${escapeHtml(product.name)}</div>
            <div class="product-price">¥${product.price.toLocaleString()} / 人前</div>
            <div class="stock-badge" id="stock-${product.id}">受け取り日を選択すると残り人前数を表示します</div>
          </div>
          <div class="serving-add-row">
            <select class="serving-select" id="serving-select-${product.id}">
              ${servingSelectOptionsHtml(product.maxServings)}
            </select>
            ${servingCountControlHtml(product.id)}
            ${servingBoxCheckHtml(product.id)}
            <div class="serving-purpose-group">
              <label><input type="radio" name="servingPurpose-${product.id}" value="home" checked>自宅用</label>
              <label><input type="radio" name="servingPurpose-${product.id}" value="gift">お土産用</label>
            </div>
            <button type="button" class="serving-add-btn" id="serving-add-${product.id}" data-id="${product.id}">追加</button>
          </div>
          <div class="serving-lines" id="servingLines-${product.id}"></div>
        `;
      } else {
        row.innerHTML = `
          <div class="product-info">
            <div class="product-name">${escapeHtml(product.name)}</div>
            <div class="product-price">¥${product.price.toLocaleString()}</div>
          </div>
          <div class="qty-groups">
            <div class="qty-group">
              <span class="qty-label">自宅用</span>
              ${qtyControlHtml(product.id, "home")}
            </div>
            <div class="qty-group">
              <span class="qty-label">お土産用</span>
              ${qtyControlHtml(product.id, "gift")}
            </div>
          </div>
        `;
      }
    } else {
      if (serving) {
        row.className = "product-row product-row--split";
        row.innerHTML = `
          <div class="product-info">
            <div class="product-name">${escapeHtml(product.name)}</div>
            <div class="product-price">¥${product.price.toLocaleString()} / 人前</div>
            <div class="stock-badge" id="stock-${product.id}">発送日を選択すると残り人前数を表示します</div>
          </div>
          <div class="serving-add-row">
            <select class="serving-select" id="serving-select-${product.id}">
              ${servingSelectOptionsHtml(product.maxServings)}
            </select>
            ${servingCountControlHtml(product.id)}
            ${servingBoxCheckHtml(product.id)}
            <button type="button" class="serving-add-btn" id="serving-add-${product.id}" data-id="${product.id}">追加</button>
          </div>
          <div class="serving-lines" id="servingLines-${product.id}"></div>
        `;
      } else {
        row.className = "product-row";
        row.innerHTML = `
          <div class="product-info">
            <div class="product-name">${escapeHtml(product.name)}</div>
            <div class="product-price">¥${product.price.toLocaleString()}</div>
          </div>
          ${qtyControlHtml(product.id, "ship")}
        `;
      }
    }

    productListEl.appendChild(row);
  });

  // DOM生成後に現在の数量・人前ラインを反映
  visibleProducts.forEach((product) => {
    if (isServingBased(product)) {
      const countEl = document.getElementById(`serving-count-${product.id}`);
      if (countEl) countEl.textContent = servingPendingCount[product.id] || 1;
      updateServingBoxLabel(product.id);
      renderServingLinesList(product.id);
      return;
    }
    const purposes = deliveryType === "pickup" ? ["home", "gift"] : ["ship"];
    purposes.forEach((purpose) => {
      const el = document.getElementById(`qty-${product.id}-${purpose}`);
      if (el) el.textContent = quantities[product.id][purpose];
    });
  });

  updateTotal();
}

function handleQtyClick(e) {
  const btn = e.target.closest(".qty-btn");
  if (!btn) return;
  const id = btn.dataset.id;
  const purpose = btn.dataset.purpose;
  const delta = btn.dataset.action === "increase" ? 1 : -1;

  quantities[id][purpose] = Math.max(0, Math.min(99, quantities[id][purpose] + delta));
  document.getElementById(`qty-${id}-${purpose}`).textContent = quantities[id][purpose];
  updateTotal();
}

// stockRemaining[productId] の意味: undefined = 未取得（日付未選択等）, null = この日は上限なし, 数値 = 残り人前数
// 人前選択商品の「追加」ボタン・選択肢・個数ステッパーを、残数（人前×個数の合計）に応じて無効化する
function updateServingControlForCap(productId) {
  const remaining = stockRemaining[productId];
  const selectEl = document.getElementById(`serving-select-${productId}`);
  const addBtn = document.getElementById(`serving-add-${productId}`);
  const incBtn = document.querySelector(`.serving-count-btn[data-action="increase"][data-id="${productId}"]`);
  if (!selectEl || !addBtn) return;

  if (typeof remaining !== "number") {
    Array.from(selectEl.options).forEach((opt) => (opt.disabled = false));
    addBtn.disabled = false;
    if (incBtn) incBtn.disabled = false;
    return;
  }

  const usedSoFar = (servingLines[productId] || []).reduce((sum, line) => sum + line.servings * line.count, 0);
  const remainingForNewLine = Math.max(0, remaining - usedSoFar);

  Array.from(selectEl.options).forEach((opt) => {
    opt.disabled = Number(opt.value) > remainingForNewLine;
  });

  const servings = Number(selectEl.value) || 1;
  const currentCount = servingPendingCount[productId] || 1;
  const maxCount = servings > 0 ? Math.floor(remainingForNewLine / servings) : 0;

  addBtn.disabled = remainingForNewLine <= 0 || servings * currentCount > remainingForNewLine;
  if (incBtn) incBtn.disabled = currentCount >= maxCount;
}

function renderStockBadges() {
  PRODUCTS.filter(isServingBased).forEach((product) => {
    const productId = product.id;
    const badgeEl = document.getElementById(`stock-${productId}`);
    if (!badgeEl) return; // 現在の商品リストに表示されていない

    const remaining = stockRemaining[productId];
    const deliveryType = getDeliveryType();
    const unselectedHint = deliveryType === "pickup" ? "受け取り日を選択すると残り人前数を表示します" : "発送日を選択すると残り人前数を表示します";
    if (remaining === undefined) {
      badgeEl.textContent = unselectedHint;
      badgeEl.classList.remove("stock-badge--full");
    } else if (remaining === null) {
      badgeEl.textContent = "この日は上限なし";
      badgeEl.classList.remove("stock-badge--full");
    } else if (remaining <= 0) {
      badgeEl.textContent = "この日は満数のため受付できません";
      badgeEl.classList.add("stock-badge--full");
    } else {
      badgeEl.textContent = `この日の残り：${remaining}人前`;
      badgeEl.classList.remove("stock-badge--full");
    }

    updateServingControlForCap(productId);
  });
}

// 人前選択商品の「追加」ボタン・個数ステッパー・行削除ボタンのクリックを処理する（productListEl 内で委譲）
function handleServingLineClick(e) {
  const countBtn = e.target.closest(".serving-count-btn");
  if (countBtn) {
    changeServingPendingCount(countBtn.dataset.id, countBtn.dataset.action === "increase" ? 1 : -1);
    return;
  }
  const addBtn = e.target.closest(".serving-add-btn");
  if (addBtn) {
    addServingLine(addBtn.dataset.id);
    return;
  }
  const removeBtn = e.target.closest(".serving-line-remove-btn");
  if (removeBtn) {
    removeServingLine(removeBtn.dataset.id, removeBtn.dataset.lineId);
  }
}

// serving-select の変更時、個数ステッパー・追加ボタンの有効/無効を再計算する
function handleServingSelectChange(e) {
  const selectEl = e.target.closest(".serving-select");
  if (!selectEl) return;
  const productId = selectEl.id.replace("serving-select-", "");
  updateServingControlForCap(productId);
  updateServingBoxLabel(productId);
}

function changeServingPendingCount(productId, delta) {
  let next = (servingPendingCount[productId] || 1) + delta;

  if (delta > 0 && typeof stockRemaining[productId] === "number") {
    const selectEl = document.getElementById(`serving-select-${productId}`);
    const servings = selectEl ? Number(selectEl.value) || 1 : 1;
    const usedSoFar = (servingLines[productId] || []).reduce((sum, line) => sum + line.servings * line.count, 0);
    const remainingForNewLine = Math.max(0, stockRemaining[productId] - usedSoFar);
    const maxCount = servings > 0 ? Math.floor(remainingForNewLine / servings) : 0;
    if (next > maxCount) next = maxCount;
  }

  servingPendingCount[productId] = Math.max(1, Math.min(99, next));
  const countEl = document.getElementById(`serving-count-${productId}`);
  if (countEl) countEl.textContent = servingPendingCount[productId];
  updateServingControlForCap(productId);
}

function addServingLine(productId) {
  const selectEl = document.getElementById(`serving-select-${productId}`);
  if (!selectEl) return;
  const servings = Number(selectEl.value);
  const count = servingPendingCount[productId] || 1;
  if (!servings || !count) return;

  if (typeof stockRemaining[productId] === "number") {
    const usedSoFar = (servingLines[productId] || []).reduce((sum, line) => sum + line.servings * line.count, 0);
    if (usedSoFar + servings * count > stockRemaining[productId]) return; // 残り数を超えて追加できない
  }

  let purpose = null;
  if (getDeliveryType() === "pickup") {
    const checked = document.querySelector(`input[name="servingPurpose-${productId}"]:checked`);
    purpose = checked ? checked.value : "home";
  }

  const boxCheckEl = document.getElementById(`serving-box-${productId}`);
  const wantsBox = !!(boxCheckEl && boxCheckEl.checked && !boxCheckEl.disabled);
  const product = findProduct(productId);
  const box = wantsBox ? findAutoBoxForServings(servings, getProductGrade(product)) : null;

  if (!servingLines[productId]) servingLines[productId] = [];
  servingLines[productId].push({ id: makeServingLineId(), servings, count, purpose, box });

  // 追加後は個数を1・折箱チェックをオフにリセット（人前の選択はそのまま、続けて別の個数を追加しやすいように）
  servingPendingCount[productId] = 1;
  const countEl = document.getElementById(`serving-count-${productId}`);
  if (countEl) countEl.textContent = "1";
  if (boxCheckEl) boxCheckEl.checked = false;

  renderServingLinesList(productId);
  updateTotal();
}

function removeServingLine(productId, lineId) {
  servingLines[productId] = (servingLines[productId] || []).filter((line) => line.id !== lineId);
  renderServingLinesList(productId);
  updateTotal();
}

function renderServingLinesList(productId) {
  const container = document.getElementById(`servingLines-${productId}`);
  if (!container) return;
  const product = findProduct(productId);
  const lines = servingLines[productId] || [];
  container.innerHTML = lines
    .map((line) => {
      const purposeLabel = line.purpose === "gift" ? "（お土産用）" : line.purpose === "home" ? "（自宅用）" : "";
      const countLabel = line.count > 1 ? ` × ${line.count}個` : "";
      const boxLabel = line.box ? `（折箱:${line.box.name}）` : "";
      const lineTotal = product.price * line.servings * line.count + (line.box ? line.box.price * line.count : 0);
      return `
        <div class="serving-line">
          <span>${line.servings}人前${countLabel}${boxLabel}${purposeLabel} ¥${lineTotal.toLocaleString()}</span>
          <button type="button" class="serving-line-remove-btn" data-id="${productId}" data-line-id="${line.id}" aria-label="この行を削除">×</button>
        </div>
      `;
    })
    .join("");
  updateServingControlForCap(productId);
}

// うなぎ商品（人前選択商品）の日別残数を取得する。
// 店頭受け取り・配送で在庫を共有するため、仕込み日（店頭受け取りはその受け取り日、配送は出荷日＝希望日の前日）を基準に問い合わせる。
async function fetchStockAvailability() {
  const unagiIds = PRODUCTS.filter(isServingBased).map((p) => p.id);
  if (unagiIds.length === 0) return;

  const date = desiredDateInput.value;
  if (!date) {
    stockRemaining = {};
    renderStockBadges();
    return;
  }

  const prepDate = getDeliveryType() === "shipping" ? addDays(date, -1) : date;

  if (!CONFIG.gasEndpoint || CONFIG.gasEndpoint === "GAS_WEB_APP_URL_HERE") {
    stockRemaining = {};
    unagiIds.forEach((id) => {
      stockRemaining[id] = getUnagiDailyLimit(id, prepDate);
    });
    renderStockBadges();
    return;
  }

  try {
    let url = `${CONFIG.gasEndpoint}?action=unagiStock&date=${encodeURIComponent(prepDate)}`;
    if (editingOrderId) url += `&excludeOrderId=${encodeURIComponent(editingOrderId)}`;
    const res = await fetch(url);
    const data = await res.json();
    const ordered = (data && data.ordered) || {};
    stockRemaining = {};
    unagiIds.forEach((id) => {
      const limit = getUnagiDailyLimit(id, prepDate);
      stockRemaining[id] = limit === null ? null : Math.max(0, limit - (ordered[id] || 0));
    });
  } catch (err) {
    // 取得に失敗した場合はクライアント側の上限表示のみスキップ（送信時はGAS側で最終チェックされる）
    stockRemaining = {};
  }
  renderStockBadges();
}

function updateTotal() {
  const deliveryType = getDeliveryType();
  const subtotal = getSubtotal();
  const shippingFee = deliveryType === "shipping" ? getShippingFee() : 0;

  shippingFeeRowEl.classList.toggle("hidden", deliveryType !== "shipping");
  if (deliveryType === "shipping") {
    shippingFeeAmountEl.textContent =
      shippingFee === null ? "住所入力後に確定" : `¥${shippingFee.toLocaleString()}`;
  }

  const total = subtotal + (shippingFee || 0);
  totalPriceEl.textContent = `¥${total.toLocaleString()}`;
  return total;
}

function getMinSelectableDateStr() {
  const min = new Date();
  min.setHours(0, 0, 0, 0);
  min.setDate(min.getDate() + CONFIG.minDaysAhead);
  return formatLocalDate(min);
}

function setupCalendar() {
  const minStr = getMinSelectableDateStr();
  const [y, m] = minStr.split("-").map(Number);
  calendarViewDate = new Date(y, m - 1, 1);

  desiredDateDisplayBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleCalendar();
  });
  calPrevMonthBtn.addEventListener("click", () => {
    calendarViewDate.setMonth(calendarViewDate.getMonth() - 1);
    renderCalendarMonth();
  });
  calNextMonthBtn.addEventListener("click", () => {
    calendarViewDate.setMonth(calendarViewDate.getMonth() + 1);
    renderCalendarMonth();
  });
  document.addEventListener("click", (e) => {
    if (!calendarPopupEl.contains(e.target) && e.target !== desiredDateDisplayBtn) {
      closeCalendar();
    }
  });
}

function toggleCalendar() {
  if (calendarPopupEl.classList.contains("hidden")) {
    openCalendar();
  } else {
    closeCalendar();
  }
}

function openCalendar() {
  renderCalendarMonth();
  calendarPopupEl.classList.remove("hidden");
}

function closeCalendar() {
  calendarPopupEl.classList.add("hidden");
}

function renderCalendarMonth() {
  const year = calendarViewDate.getFullYear();
  const month = calendarViewDate.getMonth();
  calMonthLabelEl.textContent = `${year}年${month + 1}月`;

  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const minStr = getMinSelectableDateStr();
  const deliveryType = getDeliveryType();

  calendarGridEl.innerHTML = "";

  for (let i = 0; i < startWeekday; i++) {
    const empty = document.createElement("span");
    empty.className = "cal-day cal-day--empty";
    calendarGridEl.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatLocalDate(new Date(year, month, day));
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cal-day";
    btn.textContent = String(day);

    if (dateStr < minStr) {
      btn.classList.add("cal-day--disabled");
      btn.disabled = true;
    } else if (!isDateAvailable(dateStr, deliveryType)) {
      btn.classList.add("cal-day--closed");
      btn.disabled = true;
    } else {
      if (isSpecialOpenOverride(dateStr, deliveryType)) {
        btn.classList.add("cal-day--special");
        btn.title = "特別営業日";
      }
      btn.addEventListener("click", () => selectCalendarDate(dateStr));
    }

    if (dateStr === selectedDateStr) {
      btn.classList.add("cal-day--selected");
    }

    calendarGridEl.appendChild(btn);
  }
}

function formatDateForDisplay(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const weekdayNames = ["日", "月", "火", "水", "木", "金", "土"];
  const weekday = new Date(y, m - 1, d).getDay();
  return `${y}年${m}月${d}日（${weekdayNames[weekday]}）`;
}

function selectCalendarDate(dateStr) {
  selectedDateStr = dateStr;
  desiredDateInput.value = dateStr;
  desiredDateDisplayBtn.textContent = formatDateForDisplay(dateStr);
  desiredDateDisplayBtn.classList.remove("placeholder");
  closeCalendar();
  validateDesiredDate();
  fetchStockAvailability();
}

function resetDatePicker() {
  selectedDateStr = null;
  desiredDateInput.value = "";
  desiredDateDisplayBtn.textContent = "日付を選択してください";
  desiredDateDisplayBtn.classList.add("placeholder");
  closeCalendar();
  dateAvailabilityErrorEl.classList.add("hidden");
  dateAvailabilityErrorEl.textContent = "";
  desiredTimePickupSlotEl.value = "";
  desiredTimeSlotEl.value = "";
  stockRemaining = {};
}

function setupDeliveryTypeToggle() {
  const radios = document.querySelectorAll('input[name="deliveryType"]');
  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      const deliveryType = getDeliveryType();
      const isShipping = deliveryType === "shipping";
      shippingFieldsEl.classList.toggle("hidden", !isShipping);
      pickupNoteEl.classList.toggle("hidden", isShipping);
      desiredTimePickupSlotEl.classList.toggle("hidden", isShipping);
      pickupTimeHintEl.classList.toggle("hidden", isShipping);
      desiredTimeSlotEl.classList.toggle("hidden", !isShipping);
      timeSlotHintEl.classList.toggle("hidden", !isShipping);
      updateDateHint();
      updatePaymentHint();
      resetDatePicker();
      resetServingLines();
      if (!isShipping) {
        invoiceDifferentInput.checked = false;
        invoiceFieldsEl.classList.add("hidden");
      }
      renderProducts(deliveryType);
    });
  });
}

// 受け取り方法の切り替え時、人前選択商品のライン（自宅用/お土産用の意味が変わるため）は一旦クリアする
function resetServingLines() {
  PRODUCTS.forEach((p) => {
    servingLines[p.id] = [];
    servingPendingCount[p.id] = 1;
  });
}

function getDeliveryType() {
  return document.querySelector('input[name="deliveryType"]:checked').value;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function showError(message) {
  formErrorEl.textContent = message;
  formErrorEl.classList.remove("hidden");
  formErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
}

function clearError() {
  formErrorEl.classList.add("hidden");
  formErrorEl.textContent = "";
}

function validate(payload) {
  if (!payload.customerName.trim()) return "お名前を入力してください。";
  if (!payload.customerTel.trim()) return "電話番号を入力してください。";
  if (!payload.desiredDate) return "ご希望日を選択してください。";
  if (!payload.desiredTime) return "ご希望時間を選択してください。";
  if (!isDateAvailable(payload.desiredDate, payload.deliveryType)) {
    return payload.deliveryType === "shipping"
      ? "選択された日付は配送を承っておりません。別の日付をお選びください。"
      : "選択された日付は定休日のため店頭受け取りができません。別の日付をお選びください。";
  }
  if (payload.deliveryType === "shipping") {
    if (!payload.zip.trim()) return "郵便番号を入力してください。";
    if (!payload.address.trim()) return "ご住所を入力してください。";
    if (payload.shippingFee === null) {
      return "ご住所から送料を判定できませんでした。都道府県名を含む正しい住所をご入力ください。";
    }
    if (payload.invoiceDifferent) {
      if (!payload.invoiceRecipientName.trim()) return "請求書送付先の宛名を入力してください。";
      if (!payload.invoiceZip.trim()) return "請求書送付先の郵便番号を入力してください。";
      if (!payload.invoiceAddress.trim()) return "請求書送付先のご住所を入力してください。";
    }
  }
  if (payload.items.length === 0) return "商品を1つ以上選択してください。";
  return null;
}

function buildPayload() {
  const formData = new FormData(form);
  const deliveryType = getDeliveryType();
  const items = [];

  PRODUCTS.forEach((p) => {
    if (!p.availableFor.includes(deliveryType)) return;

    if (isServingBased(p)) {
      (servingLines[p.id] || []).forEach((line) => {
        const purpose = deliveryType === "pickup" ? (line.purpose === "gift" ? "お土産用" : "自宅用") : null;
        const boxFeeTotal = line.box ? line.box.price * line.count : 0;
        // name に「〇人前 × 〇個」「折箱サイズ」を明記して伝票上でも内訳が分かるようにする。
        // servings/packCount/boxId等は編集画面での復元用の付加情報（GAS側の在庫集計等はquantityのみ参照）。
        let name = line.count > 1 ? `${p.name}（${line.servings}人前 × ${line.count}個）` : `${p.name}（${line.servings}人前）`;
        if (line.box) name += `（折箱:${line.box.name}）`;
        items.push({
          productId: p.id,
          name,
          purpose,
          unitPrice: p.price,
          quantity: line.servings * line.count,
          subtotal: p.price * line.servings * line.count + boxFeeTotal,
          servings: line.servings,
          packCount: line.count,
          boxId: line.box ? line.box.id : null,
          boxName: line.box ? line.box.name : null,
          boxPrice: line.box ? line.box.price : 0,
          boxFeeTotal,
        });
      });
      return;
    }

    const q = quantities[p.id];
    if (deliveryType === "pickup") {
      if (q.home > 0) {
        items.push({ productId: p.id, name: p.name, purpose: "自宅用", unitPrice: p.price, quantity: q.home, subtotal: p.price * q.home });
      }
      if (q.gift > 0) {
        items.push({ productId: p.id, name: p.name, purpose: "お土産用", unitPrice: p.price, quantity: q.gift, subtotal: p.price * q.gift });
      }
    } else if (q.ship > 0) {
      items.push({ productId: p.id, name: p.name, purpose: null, unitPrice: p.price, quantity: q.ship, subtotal: p.price * q.ship });
    }
  });

  const subtotal = getSubtotal();
  const shippingFee = deliveryType === "shipping" ? getShippingFee() : 0; // null = 判定不能
  const totalAmount = subtotal + (shippingFee || 0);

  const invoiceDifferent = deliveryType === "shipping" && invoiceDifferentInput.checked;

  return {
    orderId: editingOrderId || null,
    customerName: formData.get("customerName") || "",
    customerTel: formData.get("customerTel") || "",
    customerEmail: formData.get("customerEmail") || "",
    deliveryType,
    desiredDate: formData.get("desiredDate") || "",
    desiredTime: getDesiredTime(),
    zip: formData.get("zip") || "",
    address: formData.get("address") || "",
    addressBuilding: formData.get("addressBuilding") || "",
    items,
    subtotal,
    shippingFee,
    totalAmount,
    invoiceDifferent,
    invoiceRecipientName: invoiceDifferent ? formData.get("invoiceRecipientName") || "" : "",
    invoiceZip: invoiceDifferent ? formData.get("invoiceZip") || "" : "",
    invoiceAddress: invoiceDifferent ? formData.get("invoiceAddress") || "" : "",
    invoiceAddressBuilding: invoiceDifferent ? formData.get("invoiceAddressBuilding") || "" : "",
    notes: formData.get("notes") || "",
    submittedAt: new Date().toISOString(),
  };
}

async function handleSubmit(e) {
  e.preventDefault();
  clearError();

  const payload = buildPayload();
  const error = validate(payload);
  if (error) {
    showError(error);
    return;
  }

  if (!CONFIG.gasEndpoint || CONFIG.gasEndpoint === "GAS_WEB_APP_URL_HERE") {
    showError("送信先が設定されていません（script.js の gasEndpoint を設定してください）。");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "送信中...";

  try {
    // text/plain で送ることでプリフライトを回避（GAS 側で JSON.parse する）
    const res = await fetch(CONFIG.gasEndpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const result = await res.json();
    if (!result.success) {
      // 在庫超過など、サーバー側で判定した具体的な理由をそのまま表示する
      showError(result.message || "送信内容をご確認の上、再度お試しください。");
      return;
    }

    if (editingOrderId) {
      successTitleEl.textContent = "変更を保存しました";
      successBodyEl.textContent = "ご注文内容の変更を承りました。";
    } else {
      successTitleEl.textContent = "ご注文を承りました";
      successBodyEl.textContent = "ご注文ありがとうございます。内容を確認の上、店舗より確認のご連絡をさせていただく場合がございます。";
    }
    editModeBannerEl.classList.add("hidden");
    form.classList.add("hidden");
    successMessageEl.classList.remove("hidden");
    successMessageEl.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    showError("送信に失敗しました。時間をおいて再度お試しいただくか、お電話にてご注文ください。");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = editingOrderId ? "変更を保存する" : "この内容で注文する";
  }
}

function resetForm() {
  form.reset();
  PRODUCTS.forEach((p) => (quantities[p.id] = { home: 0, gift: 0, ship: 0 }));
  resetServingLines();
  shippingFieldsEl.classList.add("hidden");
  pickupNoteEl.classList.remove("hidden");
  desiredTimePickupSlotEl.classList.remove("hidden");
  pickupTimeHintEl.classList.remove("hidden");
  desiredTimeSlotEl.classList.add("hidden");
  timeSlotHintEl.classList.add("hidden");
  updateDateHint();
  updatePaymentHint();
  resetDatePicker();
  invoiceFieldsEl.classList.add("hidden");
  renderProducts(getDeliveryType());
  successMessageEl.classList.add("hidden");
  form.classList.remove("hidden");
  clearError();

  // 編集モードを解除し、通常の新規注文フォームに戻す
  if (editingOrderId) {
    editingOrderId = null;
    editModeBannerEl.classList.add("hidden");
    submitBtn.textContent = "この内容で注文する";
    history.replaceState(null, "", window.location.pathname);
  }
}

init();
