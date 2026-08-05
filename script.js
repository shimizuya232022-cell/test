// ============================================================
// 設定：お店の情報や商品はここを編集してください
// ============================================================
const CONFIG = {
  shopName: "丸共　清水屋川魚店",
  shopContact: "お問い合わせ：0120-174-338",
  // Google Apps Script を「ウェブアプリ」として公開した後に発行される URL を貼り付けてください
  // 例: https://script.google.com/macros/s/xxxxxxxxxxxxxxxx/exec
  gasEndpoint: "https://script.google.com/macros/s/AKfycbzqKF3FHfBLJhxLxItNJqxB7_AWzMWZTgqS63z5WSCej2biaxM4FoAc7Tkdyu0gtY-NpQ/exec",
  // 注文可能な最短日（0=当日可, 1=翌日以降のみ）。店頭受け取りは当日でも受け取り希望時間の30分前まで注文できるため0、
  // 配送は前日の午前中までの受付想定のため1のまま
  minDaysAheadPickup: 0,
  minDaysAheadShipping: 1,

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

  // --- 発送不可日（配送のみ） ---
  // 店舗は営業しているが配送業者の都合等で発送作業だけできない個別の日付（"YYYY-MM-DD"）。
  // この日の翌日が着日として選択できなくなります（店頭受け取りには影響しません）
  shippingNoDispatchDates: [
    // "2026-08-13",
  ],

  // 店頭受け取りの時間帯（営業時間 9:00〜18:00、受け取りは10:00〜17:30の間で30分刻み）
  pickupTimeStart: "10:00",
  pickupTimeEnd: "17:30",
  pickupTimeStepMinutes: 30,

  // うなぎ商品（人前選択商品）の、日ごとの人前数上限（管理画面「うなぎ管理」タブで編集、店頭受け取り・配送で共有）。
  // 蒲焼・白焼きは同じ等級として合算し、真空パックは対象外。
  // GASから取得できた場合はこちらの初期値は無視されます。unagiDailyCapacity[日付（仕込み日）][等級("nami"|"tokujo")] = 上限人前数
  unagiDailyCapacity: {
    // "2026-08-05": { "nami": 20 },
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

// 人前選択商品（maxServings設定あり）の追加済みライン一覧。商品ID: [{ id, servings, count, purpose, box }]
// servings=〇人前、count=その〇人前パックの個数。purpose は店頭受け取りのみ "home"/"gift"、配送時は null。
let servingLines = {};
// 人前選択商品で「追加」ボタンを押す前の、個数ステッパーの一時的な選択値（商品ID: 個数）
let servingPendingCount = {};
// 通常の数量選択商品の追加済みライン一覧。商品ID: [{ id, quantity, purpose }]
// purpose は店頭受け取りのみ "home"/"gift"、配送時は null。
let regularLines = {};
// 通常の数量選択商品で「追加」ボタンを押す前の、数量ステッパーの一時的な選択値（商品ID: 数量）
let regularPendingCount = {};
function initCartState() {
  servingLines = {};
  servingPendingCount = {};
  regularLines = {};
  regularPendingCount = {};
  PRODUCTS.forEach((p) => {
    servingLines[p.id] = [];
    servingPendingCount[p.id] = 1;
    regularLines[p.id] = [];
    regularPendingCount[p.id] = 1;
  });
}
initCartState();

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

function makeLineId() {
  return "l" + Date.now() + Math.floor(Math.random() * 1000);
}

// 指定等級・仕込み日（店頭受け取りはその受け取り日、配送は出荷日）の有効な上限人前数を返す。上限がなければ null。
// 蒲焼・白焼きは同じ等級として合算し、真空パック（namiVac/tokujoVac）は上限対象外。
function getUnagiDailyLimit(grade, prepDateStr) {
  const byDate = CONFIG.unagiDailyCapacity[prepDateStr];
  if (byDate && Object.prototype.hasOwnProperty.call(byDate, grade)) {
    return byDate[grade];
  }
  return null;
}

// 指定等級について、現在かごに入っている（まだ送信していない）全商品の人前数合計を返す
// （蒲焼・白焼きなど同じ等級の商品をまたいで合算するため）
function getUsedServingsForGrade(grade) {
  let used = 0;
  PRODUCTS.filter(isServingBased).forEach((p) => {
    if (getProductGrade(p) !== grade) return;
    (servingLines[p.id] || []).forEach((line) => {
      used += line.servings * line.count;
    });
  });
  return used;
}

const productListEl = document.getElementById("productList");
const totalPriceEl = document.getElementById("totalPrice");
const cartPanelEl = document.getElementById("cartPanel");
const cartSummaryBarEl = document.getElementById("cartSummaryBar");
const cartSummaryCountEl = document.getElementById("cartSummaryCount");
const cartSummaryTotalEl = document.getElementById("cartSummaryTotal");
const cartItemsListEl = document.getElementById("cartItemsList");
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
const closedWeekdayHintEl = document.getElementById("closedWeekdayHint");
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
    if (Array.isArray(s.shippingNoDispatchDates)) CONFIG.shippingNoDispatchDates = s.shippingNoDispatchDates;
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
      imageUrl: p.imageUrl || "",
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
      servingLines[item.productId].push({ id: makeLineId(), servings, count, purpose, box });
      return;
    }
    const purpose = item.purpose === "自宅用" ? "home" : item.purpose === "お土産用" ? "gift" : null;
    if (!regularLines[item.productId]) regularLines[item.productId] = [];
    regularLines[item.productId].push({ id: makeLineId(), quantity: item.quantity, purpose });
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
  initCartState();
  renderProducts(getDeliveryType());
  setupDeliveryTypeToggle();
  productListEl.addEventListener("click", handleRegularLineClick);
  productListEl.addEventListener("click", handleServingLineClick);
  productListEl.addEventListener("change", handleServingSelectChange);
  productListEl.addEventListener("input", handleServingSelectChange);
  cartItemsListEl.addEventListener("click", handleCartLineClick);
  cartSummaryBarEl.addEventListener("click", () => {
    cartPanelEl.classList.toggle("cart-panel--expanded");
  });
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
      ? "お支払いは銀行振込のみとなります。商品と一緒にご請求書をお送りいたします。"
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
  // 発送不可日（配送のみ・特別営業日での上書き不可）
  if (deliveryType === "shipping" && CONFIG.shippingNoDispatchDates.includes(targetDate)) return false;
  return true;
}

// その日付が「通常は定休日/臨時休業だが特別営業により利用可能」になっているか
function isSpecialOpenOverride(dateStr, deliveryType) {
  const targetDate = deliveryType === "pickup" ? dateStr : addDays(dateStr, -1);
  if (!CONFIG.specialOpenDates.includes(targetDate)) return false;
  const weekday = new Date(`${targetDate}T00:00:00`).getDay();
  return CONFIG.pickupClosedWeekdays.includes(weekday);
}

// 受け取り不可日・配送休止日の個別日付は独自カレンダー上でグレーアウト表示されるため、
// ここでは定休日（曜日）の案内と、受け取り方法ごとの注文締切の案内だけを表示する。
function updateDateHint() {
  const deliveryType = getDeliveryType();
  const weekdayNames = ["日", "月", "火", "水", "木", "金", "土"];

  const closedWeekdayLabel = CONFIG.pickupClosedWeekdays.map((d) => `${weekdayNames[d]}曜日`).join("・");
  closedWeekdayHintEl.textContent = closedWeekdayLabel ? `定休日：${closedWeekdayLabel}` : "";

  dateHintEl.textContent =
    deliveryType === "pickup"
      ? "ご注文は受け取りご希望時間の30分前までにお願いいたします。"
      : "ご注文はご希望日前日の午前中までにお願いいたします。";
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

// 現在かごに入っている全ての行（人前選択商品・通常商品）を、表示用の統一形式で返す
function getCartEntries() {
  const deliveryType = getDeliveryType();
  const entries = [];
  PRODUCTS.forEach((p) => {
    if (!p.availableFor.includes(deliveryType)) return;
    if (isServingBased(p)) {
      (servingLines[p.id] || []).forEach((line) => {
        const boxFeeTotal = line.box ? line.box.price * line.count : 0;
        const purposeLabel = line.purpose === "gift" ? "お土産用" : line.purpose === "home" ? "自宅用" : "";
        const subParts = [purposeLabel, line.box ? `折箱:${line.box.name}` : ""].filter(Boolean);
        entries.push({
          productId: p.id,
          lineId: line.id,
          kind: "serving",
          label: `${p.name}（${line.servings * line.count}人前）`,
          subLabel: subParts.join("・"),
          amount: p.price * line.servings * line.count + boxFeeTotal,
        });
      });
      return;
    }
    (regularLines[p.id] || []).forEach((line) => {
      const purposeLabel = line.purpose === "gift" ? "お土産用" : line.purpose === "home" ? "自宅用" : "";
      entries.push({
        productId: p.id,
        lineId: line.id,
        kind: "regular",
        label: `${p.name} × ${line.quantity}`,
        subLabel: purposeLabel,
        amount: p.price * line.quantity,
      });
    });
  });
  return entries;
}

function getSubtotal() {
  return getCartEntries().reduce((sum, entry) => sum + entry.amount, 0);
}

// 人前選択商品の「〇人前」プルダウンの選択肢
// allowManual: trueの場合、プルダウンの最後に「それ以上（人数を入力）」を追加する（店頭受け取りのみ、最大人前数を超える注文用）
function servingSelectOptionsHtml(maxServings, allowManual) {
  let html = "";
  for (let i = 1; i <= maxServings; i++) {
    html += `<option value="${i}">${i}人前</option>`;
  }
  if (allowManual) {
    html += `<option value="custom" class="serving-custom-option">それ以上（人数を入力）</option>`;
  }
  return html;
}

// 「それ以上（人数を入力）」は自宅用のみ（お土産用は商品の最大人前数まで）。
// お土産用に切り替わった時点で「それ以上」が選ばれていれば、最大人前数まで引き下げる。
function updateServingCustomOptionAvailability(productId) {
  const selectEl = document.getElementById(`serving-select-${productId}`);
  if (!selectEl) return;
  const customOption = selectEl.querySelector('option[value="custom"]');
  if (!customOption) return; // 配送などそもそも「それ以上」を持たない場合

  let purpose = "home";
  if (getDeliveryType() === "pickup") {
    const checked = document.querySelector(`input[name="servingPurpose-${productId}"]:checked`);
    purpose = checked ? checked.value : "home";
  }

  const disallow = purpose === "gift";
  customOption.disabled = disallow;
  if (disallow && selectEl.value === "custom") {
    const product = findProduct(productId);
    selectEl.value = String(product.maxServings);
    const customEl = document.getElementById(`serving-select-custom-${productId}`);
    if (customEl) customEl.classList.add("hidden");
  }
}

// 「それ以上（人数を入力）」を選んだ時に表示する手入力欄（店頭受け取りのみ）
function servingSelectCustomInputHtml(productId) {
  return `<input type="number" class="serving-select-custom hidden" id="serving-select-custom-${productId}" min="1" step="1" inputmode="numeric" placeholder="人前数">`;
}

// 「〇人前」の実際の選択数を返す（プルダウンで数値を選んだ場合はその値、「それ以上」選択時は手入力欄の値）
function getSelectedServings(productId) {
  const selectEl = document.getElementById(`serving-select-${productId}`);
  if (!selectEl) return 0;
  if (selectEl.value === "custom") {
    const customEl = document.getElementById(`serving-select-custom-${productId}`);
    return customEl ? Math.max(0, Math.floor(Number(customEl.value)) || 0) : 0;
  }
  return Number(selectEl.value) || 0;
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
// 対応する折箱がない場合はチェック欄を無効化する。店頭受け取りで「自宅用」を選んでいる場合も、
// 折箱はお土産用のみのため無効化する（配送には自宅用/お土産用の区別がないため対象外）。
function updateServingBoxLabel(productId) {
  const labelEl = document.getElementById(`serving-box-label-${productId}`);
  const checkboxEl = document.getElementById(`serving-box-${productId}`);
  if (!labelEl || !checkboxEl) return;

  if (getDeliveryType() === "pickup") {
    const purposeChecked = document.querySelector(`input[name="servingPurpose-${productId}"]:checked`);
    const purpose = purposeChecked ? purposeChecked.value : "home";
    if (purpose === "home") {
      labelEl.textContent = "折箱を使う（お土産用のみ選択可）";
      checkboxEl.checked = false;
      checkboxEl.disabled = true;
      return;
    }
  }

  const servings = getSelectedServings(productId) || 1;
  const product = findProduct(productId);
  const box = findAutoBoxForServings(servings, getProductGrade(product));

  if (!box) {
    labelEl.textContent = "折箱を使う（対応する折箱なし）";
    checkboxEl.checked = false;
    checkboxEl.disabled = true;
    return;
  }
  checkboxEl.disabled = false;
  labelEl.textContent = `折箱を使う（${box.name}：+¥${box.price.toLocaleString()}/個）`;
}

// 通常の数量選択商品の「数量」ステッパー（「追加」ボタンを押す前の一時的な数量）
function regularCountControlHtml(productId) {
  return `
    <div class="serving-count-control">
      <span class="serving-count-caption">数量</span>
      <button type="button" class="serving-count-btn regular-count-btn" data-action="decrease" data-id="${productId}" aria-label="数量を減らす">−</button>
      <span class="serving-count-value" id="regular-count-${productId}">1</span>
      <button type="button" class="serving-count-btn regular-count-btn" data-action="increase" data-id="${productId}" aria-label="数量を増やす">＋</button>
    </div>
  `;
}

// 商品写真（管理画面「商品」「うなぎ管理」タブでアップロード）。未設定の商品には表示しない
function productThumbHtml(product) {
  if (!product.imageUrl) return "";
  return `<img class="product-thumb" src="${escapeHtml(product.imageUrl)}" alt="" loading="lazy">`;
}

function renderProducts(deliveryType) {
  const visibleProducts = PRODUCTS.filter((p) => p.availableFor.includes(deliveryType));

  // 表示されなくなる商品のかご内容はリセットする
  PRODUCTS.forEach((p) => {
    if (!p.availableFor.includes(deliveryType)) {
      servingLines[p.id] = [];
      regularLines[p.id] = [];
    }
  });

  productListEl.innerHTML = "";
  visibleProducts.forEach((product) => {
    const row = document.createElement("div");
    const serving = isServingBased(product);
    row.className = "product-row product-row--split";

    if (deliveryType === "pickup") {
      if (serving) {
        row.innerHTML = `
          <div class="product-info">
            ${productThumbHtml(product)}
            <div class="product-text">
              <div class="product-name">${escapeHtml(product.name)}</div>
              <div class="product-price">¥${product.price.toLocaleString()} / 人前</div>
              <div class="stock-badge" id="stock-${product.id}">受け取り日を選択すると残り人前数を表示します</div>
            </div>
          </div>
          <div class="serving-add-row">
            <select class="serving-select" id="serving-select-${product.id}">
              ${servingSelectOptionsHtml(product.maxServings, true)}
            </select>
            ${servingSelectCustomInputHtml(product.id)}
            ${servingCountControlHtml(product.id)}
            <div class="serving-purpose-group">
              <label><input type="radio" name="servingPurpose-${product.id}" value="home" checked>自宅用</label>
              <label><input type="radio" name="servingPurpose-${product.id}" value="gift">お土産用</label>
            </div>
            ${servingBoxCheckHtml(product.id)}
            <button type="button" class="serving-add-btn" id="serving-add-${product.id}" data-id="${product.id}">追加</button>
          </div>
        `;
      } else {
        row.innerHTML = `
          <div class="product-info">
            ${productThumbHtml(product)}
            <div class="product-text">
              <div class="product-name">${escapeHtml(product.name)}</div>
              <div class="product-price">¥${product.price.toLocaleString()}</div>
            </div>
          </div>
          <div class="serving-add-row">
            ${regularCountControlHtml(product.id)}
            <div class="serving-purpose-group">
              <label><input type="radio" name="regularPurpose-${product.id}" value="home" checked>自宅用</label>
              <label><input type="radio" name="regularPurpose-${product.id}" value="gift">お土産用</label>
            </div>
            <button type="button" class="regular-add-btn" data-id="${product.id}">追加</button>
          </div>
        `;
      }
    } else {
      if (serving) {
        row.innerHTML = `
          <div class="product-info">
            ${productThumbHtml(product)}
            <div class="product-text">
              <div class="product-name">${escapeHtml(product.name)}</div>
              <div class="product-price">¥${product.price.toLocaleString()} / 人前</div>
              <div class="stock-badge" id="stock-${product.id}">発送日を選択すると残り人前数を表示します</div>
            </div>
          </div>
          <div class="serving-add-row">
            <select class="serving-select" id="serving-select-${product.id}">
              ${servingSelectOptionsHtml(product.maxServings)}
            </select>
            ${servingCountControlHtml(product.id)}
            ${servingBoxCheckHtml(product.id)}
            <button type="button" class="serving-add-btn" id="serving-add-${product.id}" data-id="${product.id}">追加</button>
          </div>
        `;
      } else {
        row.innerHTML = `
          <div class="product-info">
            ${productThumbHtml(product)}
            <div class="product-text">
              <div class="product-name">${escapeHtml(product.name)}</div>
              <div class="product-price">¥${product.price.toLocaleString()}</div>
            </div>
          </div>
          <div class="serving-add-row">
            ${regularCountControlHtml(product.id)}
            <button type="button" class="regular-add-btn" data-id="${product.id}">追加</button>
          </div>
        `;
      }
    }

    productListEl.appendChild(row);
  });

  // DOM生成後に現在の個数ステッパーの値を反映
  visibleProducts.forEach((product) => {
    if (isServingBased(product)) {
      const countEl = document.getElementById(`serving-count-${product.id}`);
      if (countEl) countEl.textContent = servingPendingCount[product.id] || 1;
      updateServingCustomOptionAvailability(product.id);
      updateServingBoxLabel(product.id);
      updateServingControlForCap(product.id);
      return;
    }
    const countEl = document.getElementById(`regular-count-${product.id}`);
    if (countEl) countEl.textContent = regularPendingCount[product.id] || 1;
  });

  updateTotal();
}

// 通常の数量選択商品の「数量」ステッパー・「追加」ボタンのクリックを処理する（productListEl 内で委譲）
function handleRegularLineClick(e) {
  const countBtn = e.target.closest(".regular-count-btn");
  if (countBtn) {
    changeRegularPendingCount(countBtn.dataset.id, countBtn.dataset.action === "increase" ? 1 : -1);
    return;
  }
  const addBtn = e.target.closest(".regular-add-btn");
  if (addBtn) {
    addRegularLine(addBtn.dataset.id);
  }
}

function changeRegularPendingCount(productId, delta) {
  const next = Math.max(1, Math.min(99, (regularPendingCount[productId] || 1) + delta));
  regularPendingCount[productId] = next;
  const countEl = document.getElementById(`regular-count-${productId}`);
  if (countEl) countEl.textContent = next;
}

function addRegularLine(productId) {
  const quantity = regularPendingCount[productId] || 1;
  if (!quantity) return;

  let purpose = null;
  if (getDeliveryType() === "pickup") {
    const checked = document.querySelector(`input[name="regularPurpose-${productId}"]:checked`);
    purpose = checked ? checked.value : "home";
  }

  if (!regularLines[productId]) regularLines[productId] = [];
  regularLines[productId].push({ id: makeLineId(), quantity, purpose });

  // 追加後は数量を1にリセット（続けて別の数量を追加しやすいように）
  regularPendingCount[productId] = 1;
  const countEl = document.getElementById(`regular-count-${productId}`);
  if (countEl) countEl.textContent = "1";

  updateTotal();
}

function removeRegularLine(productId, lineId) {
  regularLines[productId] = (regularLines[productId] || []).filter((line) => line.id !== lineId);
  updateTotal();
}

// stockRemaining[grade] の意味: undefined = 未取得（日付未選択等）, null = この日は上限なし, 数値 = 残り人前数
// （蒲焼・白焼きは同じ等級として合算。真空パックの等級は常に未設定＝無制限として扱われる）
// 人前選択商品の「追加」ボタン・選択肢・個数ステッパーを、残数（人前×個数の合計）に応じて無効化する
function updateServingControlForCap(productId) {
  const product = findProduct(productId);
  const grade = getProductGrade(product);
  const remaining = stockRemaining[grade];
  const selectEl = document.getElementById(`serving-select-${productId}`);
  const addBtn = document.getElementById(`serving-add-${productId}`);
  const incBtn = document.querySelector(`.serving-count-btn[data-action="increase"][data-id="${productId}"]`);
  if (!selectEl || !addBtn) return;

  if (typeof remaining !== "number") {
    // 「それ以上」の無効/有効はupdateServingCustomOptionAvailability（自宅用/お土産用）が管理するため、ここでは触らない
    Array.from(selectEl.options).forEach((opt) => {
      if (opt.value === "custom") return;
      opt.disabled = false;
    });
    addBtn.disabled = false;
    if (incBtn) incBtn.disabled = false;
    return;
  }

  const usedSoFar = getUsedServingsForGrade(grade);
  const remainingForNewLine = Math.max(0, remaining - usedSoFar);

  Array.from(selectEl.options).forEach((opt) => {
    if (opt.value === "custom") return; // 手入力欄は個別に検証するため、選択肢自体は無効化しない
    opt.disabled = Number(opt.value) > remainingForNewLine;
  });

  const servings = getSelectedServings(productId) || 1;
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

    const grade = getProductGrade(product);
    if (grade === "namiVac" || grade === "tokujoVac") {
      badgeEl.textContent = "真空パックは日ごとの人前数上限の対象外です";
      badgeEl.classList.remove("stock-badge--full");
      updateServingControlForCap(productId);
      return;
    }

    const remaining = stockRemaining[grade];
    const deliveryType = getDeliveryType();
    const unselectedHint = deliveryType === "pickup" ? "受け取り日を選択すると残り人前数を表示します" : "発送日を選択すると残り人前数を表示します";
    if (remaining === undefined) {
      badgeEl.textContent = unselectedHint;
      badgeEl.classList.remove("stock-badge--full");
    } else if (remaining === null) {
      badgeEl.textContent = "この日は上限なし";
      badgeEl.classList.remove("stock-badge--full");
    } else if (remaining <= 0) {
      badgeEl.textContent = "この日は満数のため受付できません（蒲焼・白焼き合算）";
      badgeEl.classList.add("stock-badge--full");
    } else {
      badgeEl.textContent = `この日の残り：${remaining}人前（蒲焼・白焼き合算）`;
      badgeEl.classList.remove("stock-badge--full");
    }

    updateServingControlForCap(productId);
  });
}

// 人前選択商品の「追加」ボタン・個数ステッパー・行削除ボタンのクリックを処理する（productListEl 内で委譲）
function handleServingLineClick(e) {
  // 「数量」用の regular-count-btn と誤反応しないよう、うなぎ商品専用のボタンだけを拾う
  const countBtn = e.target.closest(".serving-count-btn:not(.regular-count-btn)");
  if (countBtn) {
    changeServingPendingCount(countBtn.dataset.id, countBtn.dataset.action === "increase" ? 1 : -1);
    return;
  }
  const addBtn = e.target.closest(".serving-add-btn");
  if (addBtn) {
    addServingLine(addBtn.dataset.id);
  }
}

// serving-select（またはその手入力欄）の変更時、個数ステッパー・追加ボタンの有効/無効を再計算する
function handleServingSelectChange(e) {
  const purposeEl = e.target.closest('input[name^="servingPurpose-"]');
  if (purposeEl) {
    const productId = purposeEl.name.replace("servingPurpose-", "");
    updateServingCustomOptionAvailability(productId);
    updateServingControlForCap(productId);
    updateServingBoxLabel(productId);
    return;
  }
  const selectEl = e.target.closest(".serving-select");
  if (selectEl) {
    const productId = selectEl.id.replace("serving-select-", "");
    const customEl = document.getElementById(`serving-select-custom-${productId}`);
    if (customEl) customEl.classList.toggle("hidden", selectEl.value !== "custom");
    updateServingControlForCap(productId);
    updateServingBoxLabel(productId);
    return;
  }
  const customEl = e.target.closest(".serving-select-custom");
  if (customEl) {
    const productId = customEl.id.replace("serving-select-custom-", "");
    updateServingControlForCap(productId);
    updateServingBoxLabel(productId);
  }
}

function changeServingPendingCount(productId, delta) {
  let next = (servingPendingCount[productId] || 1) + delta;

  const product = findProduct(productId);
  const grade = getProductGrade(product);

  if (delta > 0 && typeof stockRemaining[grade] === "number") {
    const servings = getSelectedServings(productId) || 1;
    const usedSoFar = getUsedServingsForGrade(grade);
    const remainingForNewLine = Math.max(0, stockRemaining[grade] - usedSoFar);
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
  const servings = getSelectedServings(productId);
  const count = servingPendingCount[productId] || 1;
  if (!servings || !count) return;

  const product = findProduct(productId);
  const grade = getProductGrade(product);

  if (typeof stockRemaining[grade] === "number") {
    const usedSoFar = getUsedServingsForGrade(grade);
    if (usedSoFar + servings * count > stockRemaining[grade]) return; // 残り数を超えて追加できない
  }

  let purpose = null;
  if (getDeliveryType() === "pickup") {
    const checked = document.querySelector(`input[name="servingPurpose-${productId}"]:checked`);
    purpose = checked ? checked.value : "home";
  }

  const boxCheckEl = document.getElementById(`serving-box-${productId}`);
  const wantsBox = !!(boxCheckEl && boxCheckEl.checked && !boxCheckEl.disabled);
  const box = wantsBox ? findAutoBoxForServings(servings, grade) : null;

  if (!servingLines[productId]) servingLines[productId] = [];
  servingLines[productId].push({ id: makeLineId(), servings, count, purpose, box });

  // 追加後は個数を1・折箱チェックをオフにリセット（人前の選択はそのまま、続けて別の個数を追加しやすいように）
  servingPendingCount[productId] = 1;
  const countEl = document.getElementById(`serving-count-${productId}`);
  if (countEl) countEl.textContent = "1";
  if (boxCheckEl) boxCheckEl.checked = false;

  updateServingControlForCap(productId);
  updateTotal();
}

function removeServingLine(productId, lineId) {
  servingLines[productId] = (servingLines[productId] || []).filter((line) => line.id !== lineId);
  updateServingControlForCap(productId);
  updateTotal();
}

// うなぎ商品（人前選択商品）の日別残数を等級（並・特上）ごとに取得する。蒲焼・白焼きは合算、真空パックは対象外。
// 店頭受け取り・配送で在庫を共有するため、仕込み日（店頭受け取りはその受け取り日、配送は出荷日＝希望日の前日）を基準に問い合わせる。
async function fetchStockAvailability() {
  const grades = ["nami", "tokujo"]; // 真空パックの等級は上限対象外のため含めない
  if (!PRODUCTS.some(isServingBased)) return;

  const date = desiredDateInput.value;
  if (!date) {
    stockRemaining = {};
    renderStockBadges();
    return;
  }

  const prepDate = getDeliveryType() === "shipping" ? addDays(date, -1) : date;

  if (!CONFIG.gasEndpoint || CONFIG.gasEndpoint === "GAS_WEB_APP_URL_HERE") {
    stockRemaining = {};
    grades.forEach((grade) => {
      stockRemaining[grade] = getUnagiDailyLimit(grade, prepDate);
    });
    renderStockBadges();
    return;
  }

  try {
    let url = `${CONFIG.gasEndpoint}?action=unagiStock&date=${encodeURIComponent(prepDate)}`;
    if (editingOrderId) url += `&excludeOrderId=${encodeURIComponent(editingOrderId)}`;
    const res = await fetch(url);
    const data = await res.json();
    const ordered = (data && data.ordered) || {}; // 等級 -> 合計人前数
    stockRemaining = {};
    grades.forEach((grade) => {
      const limit = getUnagiDailyLimit(grade, prepDate);
      stockRemaining[grade] = limit === null ? null : Math.max(0, limit - (ordered[grade] || 0));
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
  cartSummaryTotalEl.textContent = `¥${total.toLocaleString()}`;
  renderCart();
  return total;
}

// 買い物かごパネル（右側 / モバイルは画面下部固定）の中身を描画する
function renderCart() {
  const entries = getCartEntries();

  if (entries.length === 0) {
    cartItemsListEl.innerHTML = '<p class="cart-empty-hint">まだ商品が追加されていません。</p>';
  } else {
    cartItemsListEl.innerHTML = entries
      .map(
        (entry) => `
        <div class="cart-line">
          <div class="cart-line-info">
            <div class="cart-line-name">${escapeHtml(entry.label)}</div>
            ${entry.subLabel ? `<div class="cart-line-sub">${escapeHtml(entry.subLabel)}</div>` : ""}
          </div>
          <div class="cart-line-amount">¥${entry.amount.toLocaleString()}</div>
          <button type="button" class="cart-line-remove-btn" data-kind="${entry.kind}" data-product-id="${entry.productId}" data-line-id="${entry.lineId}" aria-label="この商品をかごから削除">×</button>
        </div>
      `
      )
      .join("");
  }

  cartSummaryCountEl.textContent = `${entries.length}点`;
}

// かご内の削除ボタンのクリックを処理する（cartItemsListEl 内で委譲）
function handleCartLineClick(e) {
  const removeBtn = e.target.closest(".cart-line-remove-btn");
  if (!removeBtn) return;
  const { kind, productId, lineId } = removeBtn.dataset;
  if (kind === "serving") {
    removeServingLine(productId, lineId);
  } else {
    removeRegularLine(productId, lineId);
  }
}

function getMinSelectableDateStr(deliveryType) {
  const days = deliveryType === "shipping" ? CONFIG.minDaysAheadShipping : CONFIG.minDaysAheadPickup;
  const min = new Date();
  min.setHours(0, 0, 0, 0);
  min.setDate(min.getDate() + days);
  return formatLocalDate(min);
}

function setupCalendar() {
  const minStr = getMinSelectableDateStr(getDeliveryType());
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
  const deliveryType = getDeliveryType();
  const minStr = getMinSelectableDateStr(deliveryType);

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
      resetCartLines();
      if (!isShipping) {
        invoiceDifferentInput.checked = false;
        invoiceFieldsEl.classList.add("hidden");
      }
      renderProducts(deliveryType);
    });
  });
}

// 受け取り方法の切り替え時、かごの中身（自宅用/お土産用の意味が変わるため）は一旦クリアする
function resetCartLines() {
  PRODUCTS.forEach((p) => {
    servingLines[p.id] = [];
    servingPendingCount[p.id] = 1;
    regularLines[p.id] = [];
    regularPendingCount[p.id] = 1;
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

// 注文送信時、締切（店頭受け取り＝希望時間の30分前まで／配送＝希望日前日の正午まで）を過ぎていないか判定する。
// 問題なければnull、過ぎていればエラーメッセージを返す。注文の編集（お客様は不可、管理画面からのみ）には適用しない。
function getOrderTimingCutoffMessage(payload) {
  const now = new Date();

  if (payload.deliveryType === "shipping") {
    // 配送：着日の前日（発送日、必ず営業日）の正午まで
    const prepDateStr = addDays(payload.desiredDate, -1);
    const cutoff = new Date(`${prepDateStr}T12:00:00`);
    if (now >= cutoff) {
      return "大変申し訳ございません。配送のご注文は、ご希望日前日の正午（12:00）までにお願いしております。日付を選び直してください。";
    }
    return null;
  }

  const desired = new Date(`${payload.desiredDate}T${payload.desiredTime}:00`);
  const cutoff = new Date(desired.getTime() - 30 * 60 * 1000);
  if (now >= cutoff) {
    return "大変申し訳ございません。店頭受け取りのご注文は、受け取り希望時間の30分前までにお願いしております。時間を選び直してください。";
  }
  return null;
}

function validate(payload) {
  if (!payload.customerName.trim()) return "お名前を入力してください。";
  if (!payload.customerTel.trim()) return "電話番号を入力してください。";
  if (!payload.desiredDate) return "ご希望日を選択してください。";
  if (!payload.desiredTime) return "ご希望時間を選択してください。";
  if (!payload.orderId) {
    const cutoffMessage = getOrderTimingCutoffMessage(payload);
    if (cutoffMessage) return cutoffMessage;
  }
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
        // name には合計人前数・折箱サイズを明記して伝票上でも内訳が分かるようにする（末尾の x◯は formatItems 側で付与される数量と同じ合計人前数）。
        // servings/packCount/boxId等は編集画面での復元用の付加情報（GAS側の在庫集計等はquantityのみ参照）。
        let name = `${p.name}（${line.servings * line.count}人前）`;
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

    (regularLines[p.id] || []).forEach((line) => {
      const purpose = deliveryType === "pickup" ? (line.purpose === "gift" ? "お土産用" : "自宅用") : null;
      items.push({
        productId: p.id,
        name: p.name,
        purpose,
        unitPrice: p.price,
        quantity: line.quantity,
        subtotal: p.price * line.quantity,
      });
    });
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
  resetCartLines();
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
