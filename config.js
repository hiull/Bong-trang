// config.js — MỌI CON SỐ CÂN BẰNG GAME NẰM Ở ĐÂY
// ------------------------------------------------------------------
// • Tiền tính theo đơn vị "nghìn đồng" (k). Ví dụ: 15 nghĩa là 15k.
// • Thời gian tính bằng giây (s), trừ khi tên có chữ "Ms" (mili giây).
// • Tỉ lệ phần trăm ghi dạng số thập phân: 0.6 = 60%.
// • Thông tin cá nhân (tên, lời nhắn, kỷ niệm) KHÔNG nằm ở đây mà ở personal.js.
// ------------------------------------------------------------------
window.CONFIG = {
  version: "1.0.0",

  // Phạm vi đã làm xong theo lộ trình (Mục 23). Giai đoạn 2: đủ 4 khu, Ngày 1 → 15.
  // Ngày bí mật mở ở Giai đoạn 3 (cùng khách Hiếu & nhóm bạn).
  build: {
    stage: 6,
    maxPlayableDay: 15,
    playableZones: ["tron", "nuong", "cuon", "nuoc"],
    secretPlayable: true
  },

  // Bảng màu (Mục 14.2) — main.js tự nạp vào biến CSS.
  colors: {
    cream: "#FFF6EC",
    pink: "#FF5C8A",
    pinkLight: "#FFE4EC",
    pinkDark: "#C2185B",
    orange: "#FF9F43",
    yellow: "#FFC94D",
    green: "#5BD67A",
    red: "#FF6B6B",
    purple: "#B388FF",
    brown: "#5D4037",
    wood1: "#C68B59",
    wood2: "#A0673D",
    white: "#FFFFFF",
    shadow: "rgba(93, 64, 55, 0.22)",
    loadTrack: "#FFE0C2",
    loadFill: "#FF8FAB"
  },

  // Tiền & kho
  money: {
    unit: "k",
    startWallet: 50,          // Vốn ban đầu trong ví (giá trị tạm, sửa tuỳ ý)
    buyPackQty: 5,            // Mỗi lần nhập ở màn Chuẩn bị = 5 phần
    quickBuyQty: 5,           // Nhập nhanh giữa ca = 5 phần
    quickBuyPriceMult: 2,     // Nhập nhanh giá gấp đôi
    freeStockDays: [1],       // Những ngày được tặng sẵn nguyên liệu miễn phí
    freeStockQty: 15,         // Tặng 15 phần mỗi nguyên liệu đã mở
    loseKeepRatio: 0.5,       // Thua ngày vẫn giữ 50% doanh thu
    favoriteMultiplier: 2,    // Món yêu thích (personal.js → favoriteDish) bán giá x2
    specialRequestTip: 5,     // Làm đúng yêu cầu riêng: +5k (từ Ngày 3)
    // Quỹ cứu trợ: đầu ngày nếu ví không đủ tiền nhập đủ hàng tối thiểu,
    // anh tặng mỗi nguyên liệu đang thiếu đủ rescueQty phần để tiệm không bao giờ bị kẹt
    flirtRewardTip: 20,       // giải đúng câu thính: +20k
    flirtRewardHearts: 1,     // … và +1 tim tiệm
    flirtGiveUpTip: 10,       // bấm "Chịu, anh nói đi": vẫn +10k
    rescueMinStock: 5,
    rescueQty: 5
  },

  // Thông số trong ca bán hàng
  gameplay: {
    hearts: 3,
    seatsDefault: 3,
    traysDefault: 2,
    seatCenters: { 3: [17, 50, 83], 4: [12.5, 37.5, 62.5, 87.5] }, // % chiều ngang
    firstCustomerDelaySec: 1.2,
    customerEnterSec: 0.6,
    customerExitSec: 0.5,
    speechShowSec: 2.2,        // Câu gọi món hiện bao lâu rồi đổi sang thẻ món
    reactionShowSec: 1.8,      // Câu phản hồi khi giao sai hiện bao lâu
    happyLeaveDelaySec: 0.9,
    angryLeaveDelaySec: 1.1,
    countdownStepSec: 0.6,
    endBannerSec: 1.6,
    newDishWeight: 2,          // Món mới mở trong ngày được gọi nhiều gấp đôi
    patienceHigh: 0.6,         // > 60% xanh lá
    patienceLow: 0.3,          // < 30% đỏ, nhấp nháy
    wrongPatiencePenalty: 0.10,
    speedFactor: { fast: 1.2, normal: 1.0, slow: 0.8 },
    ratingSteps: [
      { min: 0.60, stars: 5 },
      { min: 0.35, stars: 4 },
      { min: 0.15, stars: 3 },
      { min: 0, stars: 2 }
    ],
    ratingAfterWrongMax: 3,
    ratingWalkout: 1,
    dayStarRatios: [1.0, 1.3, 1.6], // 1 sao / 2 sao / 3 sao theo % mục tiêu
    trayMaxItems: 12,
    maxSameIngredient: 3,
    stationDebounceMs: 80,
    shakeNeeded: 6,
    shakeNeededUpgraded: 4,
    shakeSwipePx: 26,
    shakeTiltDeg: 15,
    dragStartPx: 10,
    swipeZonePx: 60,
    flySec: 0.25,
    recipeBookPauseUntilDay: 2,
    vibrateGood: 30,
    vibrateBad: 80,
    fontWaitMaxSec: 3,
    bootMinSec: 0.9,
    // Dành cho các giai đoạn sau
    comboStepBonus: 0.05,
    comboMax: 10,
    loveOpenDay: 6,
    loveChargePerDish: 0.10,
    loveFreezeSec: 8,
    retryHelpPatienceBonus: 0.20,
    specialRequestFromDay: 3,
    specialRequestRate: { 3: 0.3, 8: 0.5 },   // từ ngày → tỉ lệ đơn có yêu cầu riêng
    specialRequestMax: { 3: 1, 8: 2 },        // từ ngày → số yêu cầu tối đa mỗi món
    spicyMax: 3,
    twoDishFromDay: 8,
    twoDishRate: 0.35,                         // tỉ lệ khách gọi 2 món (1 bánh tráng + 1 ly nước)
    catMaxPerDay: 1,

    // Quầy nước: nhấn giữ để rót (giây)
    holdSec: { tra: 2.0, nuoc_mia: 2.0 },
    // Bếp nướng
    crackHoldSec: 0.8,                         // nhấn giữ vỉ để tán trứng
    cookSec: 6,                                // kim chạy hết thanh lửa trong 6 giây
    cookZones: { raw: 0.45, ok1: 0.15, good: 0.20, ok2: 0.08, burn: 0.12 }, // độ dài từng vùng (tổng = 1)
    goodWidenPerLevel: 0.03,                   // mỗi cấp Than hồng: vùng xanh rộng thêm
    crispyBonus: 0.10,                         // gấp ở vùng xanh: +10% tiền món đó
    // Quầy cuốn
    rollDistance: 0.55,                        // vuốt lên được 55% chiều cao bánh là cuốn xong
    // Ngày Học sinh tan trường
    groupSpawnGapSec: 0.5,
    // Khách Hiếu (Tomortle) & khách quen
    tomortleFromDay: 3,
    tomortleForceWhenLeft: 3,     // còn 3 khách cuối mà anh chưa tới thì ép anh tới ở lượt kế tiếp
    tomortleHearts: 10,           // số trái tim bay lên khi anh nhận món
    tomortleHeartsSec: 1.5,
    secretTomortleVisits: 3,
    // Anh Hiếu ghé chỉ để thả thính (không mua, không chiếm ghế, không tính vào số khách)
    tomoFlirtFromDay: 3,
    tomoFlirtPerDay: 3,
    tomoFlirtSecret: 10,
    tomoFlirtWindow: [0.15, 0.9],   // rải các lượt ghé trong khoảng 15%–90% tiến độ ca      // Ngày bí mật: anh ghé 3 lần, còn lại là nhóm bạn
    friendFromDay: 4,
    friendWeight: 0.6,            // tỉ lệ bạn bè so với 1 loại khách thường
    regularChapters: 4,
    regularLoyalTipMult: 2,       // khách ruột tip x2
    regularLoyalRate: 0.35,       // khách ruột ghé lại mỗi ngày với tỉ lệ này
    // Kỷ niệm
    typeMsPerChar: 30,
    endingSlideSec: 3,
    endingWalkSec: 2.2
  },

  // 3 khách quen có cốt truyện (Mục 8.2). Mỗi chương có 2 lựa chọn, lựa chọn nào cũng có lợi.
  // effect: tip (+k ngay), wallet (+k vào ví), customer (+1 khách ngày mai), decor (tặng đồ trang trí)
  regulars: {
    chi_lan: {
      name: "Chị Lan Kế Toán", avatar: "👩‍💼", doodle: "chi_lan", self: "chị", call: "em", dish: "bt_tron_kho_bo",
      patience: 30, tip: [3, 5], startDay: 2, gap: 2,
      chapters: [
        { text: "Chị làm kế toán ở toà nhà đối diện nè. Tháng này quyết toán, chị tăng ca hoài luôn em ơi.",
          choices: [
            { label: "Chị ăn thêm cho có sức nha, em bỏ nhiều khô bò cho chị!", effect: { tip: 5 } },
            { label: "Chị nhớ nghỉ ngơi xíu, sức khoẻ là trên hết á!", effect: { customer: 1 } }
          ] },
        { text: "Hôm qua chị rủ mấy đứa trong phòng qua ăn, tụi nó khen quá trời. Sếp chị cũng ghiền luôn rồi đó!",
          choices: [
            { label: "Dạ em cảm ơn chị đã giới thiệu nha 💕", effect: { wallet: 20 } },
            { label: "Lần sau chị dẫn sếp qua, em làm phần đặc biệt!", effect: { customer: 1 } }
          ] },
        { text: "Chị vừa được tăng lương nè em! Chị mua tặng tiệm cái đèn lồng nhỏ treo cho đẹp nha.",
          choices: [
            { label: "Trời ơi, em cảm ơn chị nhiều lắm!", effect: { decor: "den_long" } },
            { label: "Chúc mừng chị! Chị xứng đáng lắm luôn!", effect: { tip: 10 } }
          ] },
        { text: "Chị sắp chuyển qua chi nhánh khác rồi… nhưng cuối tuần nào chị cũng ghé tiệm em hết á!",
          choices: [
            { label: "Chị nhớ ghé nha, em để dành khô bò cho chị!", effect: { tip: 10 } },
            { label: "Tiệm lúc nào cũng có chỗ cho chị hết!", effect: { wallet: 20 } }
          ] }
      ] },
    chu_tu: {
      name: "Chú Tư Xe Ôm", avatar: "🧔", doodle: "chu_tu", accessory: "🛵", self: "chú", call: "con", dish: "bt_nuong_trung",
      patience: 30, tip: [2, 4], startDay: 4, gap: 2,
      chapters: [
        { text: "Chú chạy xe ôm trước cổng trường hoài mà giờ mới ghé. Mua cái bánh nướng cho bé Út cháu gái chú nè con.",
          choices: [
            { label: "Dạ con nướng giòn giòn cho bé nha chú!", effect: { tip: 5 } },
            { label: "Lần sau chú dẫn bé Út qua chơi nha!", effect: { customer: 1 } }
          ] },
        { text: "Bé Út khen bánh con nướng ngon nhất trường đó. Nó còn vẽ tặng tiệm một tấm hình nữa nè.",
          choices: [
            { label: "Dễ thương quá! Con dán lên tủ liền nha chú", effect: { wallet: 15 } },
            { label: "Chú cảm ơn bé Út giùm con nha!", effect: { tip: 5 } }
          ] },
        { text: "Hôm nay nắng quá, chú chở khách cả ngày mệt rã rời… Ăn cái bánh của con là khoẻ re liền.",
          choices: [
            { label: "Chú nhớ uống nhiều nước cho mát nha!", effect: { wallet: 10 } },
            { label: "Chú đội nón kỹ kẻo say nắng nha chú!", effect: { tip: 5 } }
          ] },
        { text: "Từ giờ chú chở khách nào cũng giới thiệu tiệm của con hết! Tiệm {shop} là số một!",
          choices: [
            { label: "Con cảm ơn chú nhiều lắm!", effect: { customer: 1 } },
            { label: "Chú với bé Út là khách ruột của tiệm luôn rồi đó!", effect: { tip: 10 } }
          ] }
      ] },
    be_na: {
      name: "Bé Na Lớp 10", avatar: "👧", doodle: "be_na", self: "em", call: "chị", dish: "bt_cuon_bo",
      patience: 30, tip: [0, 2], startDay: 7, gap: 2,
      chapters: [
        { text: "Chị ơi, em để dành tiền ăn sáng cả tuần mới đủ mua cuốn bơ đó. Ngon dữ thần luôn!",
          choices: [
            { label: "Em nhớ ăn sáng đầy đủ nha, đừng nhịn đói!", effect: { tip: 3 } },
            { label: "Lần sau rủ bạn qua, chị làm nhiều bơ cho!", effect: { customer: 1 } }
          ] },
        { text: "Hôm nay em bị cô kêu lên bảng mà làm được bài luôn chị ơi! Vui quá nên ghé ăn mừng nè.",
          choices: [
            { label: "Giỏi quá! Chị thưởng em thêm muối tôm nha!", effect: { tip: 5 } },
            { label: "Cố lên Na, chị tin em thi tốt!", effect: { customer: 1 } }
          ] },
        { text: "Em với mấy bạn làm báo tường có viết về tiệm chị đó! Tụi em tặng chị chậu hoa giấy nè.",
          choices: [
            { label: "Trời, cảm ơn em với các bạn nha!", effect: { decor: "hoa_giay" } },
            { label: "Cho chị đọc bài báo với!", effect: { tip: 5 } }
          ] },
        { text: "Em đậu đội tuyển văn của trường rồi! Mai mốt em đi thi xa, nhưng về là ghé chị liền!",
          choices: [
            { label: "Chúc mừng Na! Chị đợi em về kể chuyện nha", effect: { customer: 1 } },
            { label: "Đi thi nhớ mang theo bánh tráng chị làm nè!", effect: { tip: 5 } }
          ] }
      ] }
  },

  // 4 khu làm món (Mục 7.1)
  zones: [
    { id: "tron", icon: "🥣", name: "Trộn", openDay: 1, container: "Bịch nilon" },
    { id: "nuong", icon: "🔥", name: "Nướng", openDay: 4, container: "Vỉ nướng" },
    { id: "cuon", icon: "🌯", name: "Cuốn", openDay: 7, container: "Thớt tre" },
    { id: "nuoc", icon: "🧋", name: "Nước", openDay: 2, container: "Ly nhựa" }
  ],

  // Vai trò nguyên liệu theo khu: đế (cho đầu tiên) / kết thúc (cho sau cùng)
  zoneRoles: {
    tron: { base: ["bt_soi"], finish: ["tac"] },
    nuong: { base: ["bt_tron"], finish: ["mayo", "tuong_ot"] },
    cuon: { base: ["bt_phoi_suong"], finish: ["nuoc_cham"] },
    nuoc: { base: ["ly"], finish: ["tra", "nuoc_mia", "da"] }
  },

  // Nguyên liệu (Mục 7.2). price = giá nhập 5 phần. short = tên ngắn dùng trong câu thoại.
  ingredients: {
    bt_soi:        { name: "Bánh tráng sợi",          short: "bánh tráng sợi", emoji: "🍜", zones: ["tron"], openDay: 1, price: 5 },
    kho_bo:        { name: "Khô bò",                  short: "khô bò",         emoji: "🥩", zones: ["tron", "cuon"], openDay: 1, price: 15 },
    trung_cut:     { name: "Trứng cút",               short: "trứng cút",      emoji: "🥚", zones: ["tron", "nuong"], openDay: 1, price: 8 },
    xoai:          { name: "Xoài xanh bào",           short: "xoài",           emoji: "🥭", zones: ["tron"], openDay: 1, price: 6 },
    rau_ram:       { name: "Rau răm",                 short: "rau răm",        emoji: "🌿", zones: ["tron", "cuon"], openDay: 1, price: 3 },
    dau_phong:     { name: "Đậu phộng rang",          short: "đậu phộng",      emoji: "🥜", zones: ["tron", "nuong"], openDay: 1, price: 4 },
    tac:           { name: "Tắc (quất) vắt",          short: "tắc",            emoji: "🍋", zones: ["tron", "nuoc"], openDay: 1, price: 3 },
    hanh_phi:      { name: "Hành phi",                short: "hành phi",       emoji: "🧅", zones: ["tron", "nuong", "cuon"], openDay: 2, price: 4 },
    ly:            { name: "Ly nhựa",                 short: "ly",             emoji: "🥤", zones: ["nuoc"], openDay: 2, price: 2 },
    tra:           { name: "Bình trà",                short: "trà",            emoji: "🫖", zones: ["nuoc"], openDay: 2, price: 3 },
    da:            { name: "Đá",                      short: "đá",             emoji: "🧊", zones: ["nuoc"], openDay: 2, price: 1 },
    sa_te:         { name: "Sa tế",                   short: "sa tế",          emoji: "🌶️", zones: ["tron", "nuong"], openDay: 3, price: 5 },
    kho_muc:       { name: "Khô mực xé",              short: "khô mực",        emoji: "🦑", zones: ["tron"], openDay: 3, price: 18 },
    bt_tron:       { name: "Bánh tráng tròn (nướng)", short: "bánh tráng tròn", emoji: "⚪", zones: ["nuong"], openDay: 4, price: 5 },
    hanh_la:       { name: "Hành lá",                 short: "hành lá",        emoji: "🌱", zones: ["nuong"], openDay: 4, price: 3 },
    mayo:          { name: "Mayonnaise",              short: "sốt mayonnaise", emoji: "🥫", zones: ["nuong"], openDay: 4, price: 6 },
    tuong_ot:      { name: "Tương ớt",                short: "tương ớt",       emoji: "🔴", zones: ["nuong"], openDay: 4, price: 5 },
    muoi_tom:      { name: "Muối tôm",                short: "muối tôm",       emoji: "🧂", zones: ["tron", "cuon"], openDay: 5, price: 4 },
    bo_beo:        { name: "Bơ béo (sốt bơ)",         short: "sốt bơ",         emoji: "🧈", zones: ["tron", "cuon"], openDay: 5, price: 8 },
    xuc_xich:      { name: "Xúc xích",                short: "xúc xích",       emoji: "🌭", zones: ["nuong"], openDay: 6, price: 12 },
    cha_bong:      { name: "Chà bông",                short: "chà bông",       emoji: "🟫", zones: ["nuong", "cuon"], openDay: 6, price: 10 },
    bt_phoi_suong: { name: "Bánh tráng phơi sương",   short: "bánh tráng phơi sương", emoji: "📃", zones: ["cuon"], openDay: 7, price: 6 },
    thit_luoc:     { name: "Thịt luộc",               short: "thịt luộc",      emoji: "🥓", zones: ["cuon"], openDay: 7, price: 15 },
    rau_song:      { name: "Rau sống",                short: "rau sống",       emoji: "🥬", zones: ["cuon"], openDay: 7, price: 4 },
    nuoc_cham:     { name: "Nước chấm me",            short: "nước chấm",      emoji: "🫙", zones: ["cuon"], openDay: 7, price: 5 },
    nuoc_mia:      { name: "Nước mía",                short: "nước mía",       emoji: "🎋", zones: ["nuoc"], openDay: 8, price: 8 },
    pho_mai:       { name: "Phô mai",                 short: "phô mai",        emoji: "🧀", zones: ["nuong"], openDay: 9, price: 15 },
    tom_kho:       { name: "Tép (tôm khô)",           short: "tép",            emoji: "🦐", zones: ["tron"], openDay: 10, price: 12 },
    tran_chau:     { name: "Trân châu",               short: "trân châu",      emoji: "⚫", zones: ["nuoc"], openDay: 11, price: 6 }
  },

  // Công thức 16 món (Mục 7.3).
  // finish: các bước kết thúc theo đúng thứ tự. "lac" = lắc bịch, "nuong" = canh lửa,
  // "gap" = gấp bánh, "cuon" = vuốt cuốn, "rot:tra" = nhấn giữ rót trà. Còn lại là id nguyên liệu.
  // price = giá gốc. Món yêu thích nhân thêm money.favoriteMultiplier.
  recipes: [
    { id: "bt_tron_co_ban", name: "Bánh tráng trộn cơ bản", short: "Trộn cơ bản", emoji: "🥗", zone: "tron", base: "bt_soi",
      toppings: ["xoai", "rau_ram", "dau_phong"], finish: ["tac", "lac"], price: 15, openDay: 1 },
    { id: "bt_tron_kho_bo", name: "Bánh tráng trộn khô bò", short: "Trộn khô bò", emoji: "🥗", zone: "tron", base: "bt_soi",
      toppings: ["kho_bo", "trung_cut", "xoai", "rau_ram", "dau_phong"], finish: ["tac", "lac"], price: 25, openDay: 1 },
    { id: "tra_da", name: "Trà đá", short: "Trà đá", emoji: "🧋", zone: "nuoc", base: "ly",
      toppings: [], finish: ["rot:tra", "da"], price: 3, openDay: 2 },
    { id: "tra_tac", name: "Trà tắc", short: "Trà tắc", emoji: "🍹", zone: "nuoc", base: "ly",
      toppings: ["tac"], finish: ["rot:tra", "da"], price: 10, openDay: 2 },
    { id: "bt_tron_hanh_phi", name: "Bánh tráng trộn hành phi", short: "Trộn hành phi", emoji: "🥗", zone: "tron", base: "bt_soi",
      toppings: ["trung_cut", "hanh_phi", "rau_ram", "dau_phong"], finish: ["tac", "lac"], price: 20, openDay: 2 },
    { id: "bt_tron_kho_muc", name: "Bánh tráng trộn khô mực", short: "Trộn khô mực", emoji: "🥗", zone: "tron", base: "bt_soi",
      toppings: ["kho_muc", "trung_cut", "xoai", "rau_ram", "sa_te"], finish: ["tac", "lac"], price: 30, openDay: 3 },
    { id: "bt_nuong_trung", name: "Bánh tráng nướng trứng", short: "Nướng trứng", emoji: "🍕", zone: "nuong", base: "bt_tron",
      toppings: ["trung_cut", "hanh_la", "dau_phong"], finish: ["nuong", "gap", "mayo"], price: 18, openDay: 4 },
    { id: "bt_bo", name: "Bánh tráng bơ", short: "Bánh tráng bơ", emoji: "🥗", zone: "tron", base: "bt_soi",
      toppings: ["bo_beo", "muoi_tom", "hanh_phi", "rau_ram"], finish: ["lac"], price: 22, openDay: 5 },
    { id: "bt_nuong_xuc_xich", name: "Bánh tráng nướng xúc xích", short: "Nướng xúc xích", emoji: "🍕", zone: "nuong", base: "bt_tron",
      toppings: ["trung_cut", "xuc_xich", "hanh_la", "cha_bong"], finish: ["nuong", "gap", "tuong_ot"], price: 25, openDay: 6 },
    { id: "bt_cuon_bo", name: "Bánh tráng cuốn bơ", short: "Cuốn bơ", emoji: "🌯", zone: "cuon", base: "bt_phoi_suong",
      toppings: ["bo_beo", "muoi_tom", "cha_bong", "kho_bo"], finish: ["cuon", "nuoc_cham"], price: 25, openDay: 7 },
    { id: "bt_cuon_thit", name: "Bánh tráng phơi sương cuốn thịt", short: "Cuốn thịt", emoji: "🌯", zone: "cuon", base: "bt_phoi_suong",
      toppings: ["thit_luoc", "rau_song", "rau_ram"], finish: ["cuon", "nuoc_cham"], price: 30, openDay: 7 },
    { id: "nuoc_mia_ly", name: "Nước mía", short: "Nước mía", emoji: "🥤", zone: "nuoc", base: "ly",
      toppings: ["tac"], finish: ["rot:nuoc_mia", "da"], price: 12, openDay: 8 },
    { id: "bt_nuong_pho_mai", name: "Bánh tráng nướng phô mai", short: "Nướng phô mai", emoji: "🍕", zone: "nuong", base: "bt_tron",
      toppings: ["trung_cut", "pho_mai", "xuc_xich", "hanh_la"], finish: ["nuong", "gap", "mayo"], price: 32, openDay: 9 },
    { id: "bt_tron_dac_biet", name: "Bánh tráng trộn đặc biệt", short: "Trộn đặc biệt", emoji: "🥗", zone: "tron", base: "bt_soi",
      toppings: ["kho_bo", "kho_muc", "tom_kho", "trung_cut", "xoai", "rau_ram", "dau_phong", "hanh_phi"], finish: ["tac", "lac"], price: 40, openDay: 10 },
    { id: "tra_sua_tran_chau", name: "Trà sữa trân châu", short: "Trà sữa", emoji: "🧋", zone: "nuoc", base: "ly",
      toppings: ["tran_chau"], finish: ["rot:tra", "da"], price: 20, openDay: 11 },
    { id: "combo_tinh_yeu", name: "Combo Tình Yêu", short: "Combo Tình Yêu", emoji: "💕", zone: "combo", base: null,
      toppings: [], finish: [], combo: ["bt_tron_kho_bo", "tra_tac"], price: 60, openDay: 14 }
  ],

  // Loại khách (Mục 8.1). patience = giây kiên nhẫn gốc. tip = [thấp nhất, cao nhất].
  // self = khách tự xưng, call = khách gọi bà chủ. kind "normal" là khách thường.
  customerTypes: {
    hoc_sinh: { name: "Học sinh", avatar: "🧑‍🎓", patience: 25, tip: [0, 2], self: "em", call: "chị",
      lines: ["Chị ơi cho em {dish} nha!"], openDay: 1, enterSec: 0.6, kind: "normal" },
    co_ban_rau: { name: "Cô bán rau", avatar: "👩‍🌾", patience: 30, tip: [1, 3], self: "cô", call: "con",
      lines: ["Con ơi cho cô {dish} nghen!"], openDay: 2, enterSec: 0.6, kind: "normal" },
    nhan_vien: { name: "Nhân viên văn phòng", avatar: "🧑‍💼", patience: 18, tip: [3, 5], self: "anh", call: "em",
      variants: [{ avatar: "👨‍💼", self: "anh" }, { avatar: "👩‍💼", self: "chị" }],
      lines: ["Em ơi cho {self} {dish}, đang tranh thủ giờ nghỉ!"], openDay: 3, enterSec: 0.6, kind: "normal" },
    tomortle: { name: "Hiếu (Tomortle)", avatar: "🧑", doodle: "tomortle", accessory: "💐", patience: Infinity, tip: [20, 20], self: "anh", call: "bé",
      openDay: 3, enterSec: 0.6, kind: "special" },
    ban_be: { name: "Bạn bè", avatar: "🧑", doodleVariants: ["friend_a", "friend_b", "friend_c", "friend_d"], patience: 30, tip: [5, 5], self: "mình", call: "{her}",
      lines: ["{Her} ơi, cho mình {dish} nha!", "Ghé tiệm {shop} ủng hộ nè!"], openDay: 4, enterSec: 0.6, kind: "friend" },
    ba_cu: { name: "Bà cụ", avatar: "👵", patience: 35, tip: [2, 2], self: "bà", call: "cháu",
      lines: ["Cháu ơi, cho bà {dish} nghen cháu!"], openDay: 5, enterSec: 1.2, kind: "normal" },
    shipper: { name: "Anh shipper", avatar: "🧑", doodle: "shipper", patience: 15, tip: [5, 8], self: "anh", call: "em",
      lines: ["Như mọi khi nha em, anh đang vội giao đơn!"], openDay: 6, enterSec: 0.6, kind: "normal" },
    meo_hoang: { name: "Mèo hoang", avatar: "🐈", patience: 20, tip: [0, 0], heartBonus: 1, rareRate: 0.05,
      openDay: 7, enterSec: 0.6, kind: "cat" }
  },

  // Âm thanh: pool kênh cho tiếng chạm liên tục, bản nhạc nền của từng màn hình
  audio: {
    poolSize: 4,
    screenMusic: { Boot: null, Menu: "menu", Map: "menu", Prep: "menu", Shop: "menu", Album: "menu", Review: "menu", Result: "menu", Game: "game", Ending: "ending" },
    rainWeather: "rain"            // ngày có thời tiết này dùng nhạc trời mưa
  },

  // Hướng dẫn tương tác (Ngày 1, 2, 4, 7): khu cần dạy và lúc bắt đầu
  tutorials: {
    1: { zone: "tron", key: "day1" },
    2: { zone: "nuoc", key: "day2" },
    4: { zone: "nuong", key: "day4" },
    7: { zone: "cuon", key: "day7" }
  },

  // Yêu cầu riêng của khách (Mục 7.4)
  specialRequests: [
    { id: "no_rau_ram", type: "remove", ing: "rau_ram", text: "không rau răm" },
    { id: "no_xoai", type: "remove", ing: "xoai", text: "không xoài" },
    { id: "no_hanh_phi", type: "remove", ing: "hanh_phi", text: "không hành phi" },
    { id: "it_da", type: "remove", ing: "da", text: "ít đá" },
    { id: "them_trung", type: "double", ing: "trung_cut", text: "thêm trứng cút" },
    { id: "nhieu_kho_bo", type: "double", ing: "kho_bo", text: "nhiều khô bò" },
    { id: "nuong_gion", type: "crispy", text: "nướng giòn" },
    { id: "cay", type: "spicy", text: "🌶️ x{n}" }
  ],

  // Thời tiết & sự kiện (Mục 10)
  weathers: {
    sunny:    { icon: "☀️", label: "Nắng đẹp" },
    windy:    { icon: "🌬️", label: "Gió mùa" },
    payday:   { icon: "💰", label: "Ngày lãnh lương", note: "Tip gấp đôi" },
    hot:      { icon: "🥵", label: "Nắng nóng", note: "Khách gọi nước nhiều gấp đôi" },
    reviewer: { icon: "⭐", label: "Người review ghé tiệm", note: "Đánh giá tính gấp 3" },
    rain:     { icon: "🌧️", label: "Trời mưa", note: "Khách gọi đồ nướng nhiều gấp đôi" },
    school:   { icon: "🎒", label: "Học sinh tan trường", note: "Giữa ca có nhóm 3 học sinh đến cùng lúc" },
    festival: { icon: "🏮", label: "Lễ hội phố", note: "Khách đến nhộn nhịp, tip cao" },
    sunset:   { icon: "🌅", label: "Hoàng hôn kỷ niệm" },
    secret:   { icon: "★", label: "Ngày bí mật", note: "Không thể thua" }
  },

  // Mùa & mốc: 15 ngày bên dưới là 15 mốc lớn; giữa các mốc lớn có mốc nhỏ (minorPerMajor).
  seasons: [
    { id: 1, name: "Mùa 1 · Tiệm nhỏ đầu hẻm", majorDays: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], minorPerMajor: 1 }
  ],
  milestones: {
    shiftsBase: 2,            // số "ca chuẩn" cần cho mốc đầu tiên
    shiftsGrowth: 0.04,       // mỗi mốc sau cần thêm chừng này ca chuẩn
    replayProgressRate: 0.5,  // chơi lại mốc cũ: tiến độ cho mốc hiện tại nhân hệ số này
    carryMax: 0.5,            // phần dư mang sang mốc kế tối đa
    unitsPass: 1, unitsThreeStar: 1.25, unitsFailMin: 0.25, unitsFailRatio: 0.6,
    afterLast: { customers: 1, targetMult: 1.08 },   // mốc nhỏ sau mốc lớn cuối
    minorCoinsBase: 40, minorCoinsPerLevel: 10       // thưởng qua mốc nhỏ (k)
  },
  // Biến cố ngẫu nhiên mỗi ca (không phải ca kịch bản). w = trọng số, fromLevel = cấp mốc bắt đầu có.
  shiftEvents: {
    sunny:    { w: 3, fromLevel: 1 },
    windy:    { w: 2, fromLevel: 3 },
    payday:   { w: 1, fromLevel: 5, tipMult: 2 },
    hot:      { w: 2, fromLevel: 8, drinkWeight: 2 },
    reviewer: { w: 1, fromLevel: 9, ratingWeight: 3 },
    rain:     { w: 1, fromLevel: 10, grillWeight: 2 },
    school:   { w: 1, fromLevel: 12, groupOf: 3 },
    festival: { w: 1, fromLevel: 13, tipMult: 1.5 }
  },

  // 15 Ngày bán hàng + Ngày bí mật (Mục 10). target = mục tiêu doanh thu (k).
  days: [
    { day: 1,  customers: 8,  target: 60,  spawn: [6, 8],     patienceMult: 1.30, unlock: ["bt_tron_co_ban", "bt_tron_kho_bo"], weather: "sunny", tipMult: 1, hints: true,
      note: "Có hướng dẫn từng bước (Quầy trộn); miễn phí 15 phần mỗi nguyên liệu đầu ngày" },
    { day: 2,  customers: 9,  target: 90,  spawn: [5, 7],     patienceMult: 1.25, unlock: ["tra_da", "tra_tac", "bt_tron_hanh_phi"], weather: "sunny", tipMult: 1, hints: true,
      note: "Mở màn Chuẩn bị nhập hàng; hướng dẫn vuốt sang quầy nước & nhấn giữ rót" },
    { day: 3,  customers: 10, target: 120, spawn: [5, 7],     patienceMult: 1.20, unlock: ["bt_tron_kho_muc"], weather: "windy", tipMult: 1,
      note: "Khách Hiếu (Tomortle) xuất hiện lần đầu; bắt đầu có yêu cầu riêng" },
    { day: 4,  customers: 11, target: 150, spawn: [4.5, 6.5], patienceMult: 1.20, unlock: ["bt_nuong_trung"], weather: "sunny", tipMult: 1, hints: true,
      note: "Hướng dẫn bếp nướng" },
    { day: 5,  customers: 11, target: 180, spawn: [4.5, 6],   patienceMult: 1.15, unlock: ["bt_bo"], weather: "payday", tipMult: 2 },
    { day: 6,  customers: 12, target: 220, spawn: [4, 6],     patienceMult: 1.15, unlock: ["bt_nuong_xuc_xich"], weather: "sunny", tipMult: 1,
      note: "Mở chiêu đặc biệt Năng lượng yêu thương" },
    { day: 7,  customers: 12, target: 260, spawn: [4, 5.5],   patienceMult: 1.10, unlock: ["bt_cuon_bo", "bt_cuon_thit"], weather: "windy", tipMult: 1, hints: true,
      note: "Hướng dẫn vuốt dọc để cuốn bánh; xuất hiện mèo hoang hiếm" },
    { day: 8,  customers: 13, target: 300, spawn: [4, 5.5],   patienceMult: 1.10, unlock: ["nuoc_mia_ly"], weather: "hot", tipMult: 1, drinkWeight: 2,
      note: "Khách bắt đầu gọi 2 món" },
    { day: 9,  customers: 14, target: 350, spawn: [3.5, 5],   patienceMult: 1.05, unlock: ["bt_nuong_pho_mai"], weather: "reviewer", tipMult: 1, ratingWeight: 3 },
    { day: 10, customers: 14, target: 400, spawn: [3.5, 5],   patienceMult: 1.05, unlock: ["bt_tron_dac_biet"], weather: "rain", tipMult: 1, grillWeight: 2 },
    { day: 11, customers: 15, target: 450, spawn: [3.5, 5],   patienceMult: 1.00, unlock: ["tra_sua_tran_chau"], weather: "sunny", tipMult: 1 },
    { day: 12, customers: 16, target: 520, spawn: [3, 4.5],   patienceMult: 1.00, unlock: [], weather: "school", tipMult: 1, groupOf: 3 },
    { day: 13, customers: 16, target: 580, spawn: [3, 4.5],   patienceMult: 1.00, unlock: [], weather: "festival", tipMult: 1.5 },
    { day: 14, customers: 17, target: 650, spawn: [3, 4.5],   patienceMult: 1.00, unlock: ["combo_tinh_yeu"], weather: "payday", tipMult: 2 },
    { day: 15, customers: 18, target: 720, spawn: [3, 4],     patienceMult: 1.00, unlock: [], weather: "sunset", tipMult: 1,
      note: "Hoàn thành mở màn kết thúc & Ngày bí mật" },
    { day: "secret", customers: 15, target: 0, spawn: [3, 4], patienceMult: 1.00, unlock: [], weather: "secret", tipMult: 1, cannotLose: true }
  ],

  // Cửa hàng nâng cấp (Mục 11) — dùng từ Giai đoạn 4. prices[i] = giá để lên cấp tiếp theo.
  upgrades: {
    khay:       { name: "Thêm khay làm món", min: 2, max: 3, prices: [300], desc: "3 khay làm món cùng lúc" },
    bep:        { name: "Thêm vỉ nướng", min: 2, max: 4, prices: [200, 450], desc: "Nướng nhiều bánh cùng lúc" },
    bep_nhanh:  { name: "Than hồng loại 1", min: 0, max: 3, prices: [150, 300, 500], speedBonus: [0.1, 0.2, 0.3], desc: "Kim canh lửa nhanh hơn và vùng xanh rộng hơn" },
    ghe:        { name: "Thêm ghế khách", min: 3, max: 4, prices: [400], desc: "4 vị trí khách đứng chờ cùng lúc" },
    quat:       { name: "Quạt máy", min: 0, max: 2, prices: [200, 400], patienceBonus: [0.1, 0.2], fiveStarDrop: 0.05, desc: "Khách kiên nhẫn hơn" },
    nhac:       { name: "Loa nhạc chill", min: 0, max: 1, prices: [250], tipBonus: 0.2, desc: "Tiền tip +20%" },
    chong_chay: { name: "Quạt than tay", min: 0, max: 1, prices: [300], desc: "Vùng vàng dài gấp đôi, khó cháy hơn" },
    lac_nhanh:  { name: "Bịch dây kéo", min: 0, max: 1, prices: [200], desc: "Lắc bịch chỉ cần 4 lần" }
  },

  // Trang trí tiệm (hiện trực tiếp trên mặt tiền)
  decor: [
    { id: "den_long", name: "Đèn lồng giấy", emoji: "🏮", price: 100 },
    { id: "hoa_giay", name: "Chậu hoa giấy cổng trường", emoji: "🪴", price: 150 },
    { id: "neon", name: "Biển hiệu đèn neon", emoji: "💡", price: 300 },
    { id: "meo_than_tai", name: "Mèo thần tài vẫy tay", emoji: "😺", price: 200 },
    { id: "rem_hong", name: "Rèm hồng pastel", emoji: "🎀", price: 120 }
  ],

  pets: {
    miu: { name: "{pet}", emoji: "🐈", price: 0,
      lines: [
        "{pet} dụi đầu vào tay {her} nè 🐱",
        "{pet} ngáp một cái thật dài rồi cuộn tròn",
        "{pet} vẫy đuôi chào khách nè",
        "{pet} nhìn bịch khô bò không chớp mắt 👀",
        "{pet} kêu meo meo đòi bà chủ vuốt ve"
      ] },
    cun_bong: { name: "Cún Bông", emoji: "🐶", price: 250,
      lines: [
        "Cún Bông vẫy đuôi tít mù chào khách 🐶",
        "Cún Bông nằm ngửa đòi {her} gãi bụng",
        "Cún Bông sủa \"gâu\" một tiếng thật dễ thương",
        "Cún Bông ngậm cái dép chạy vòng vòng quanh quầy",
        "Cún Bông dụi mũi vào chân {pet} rồi nằm ngủ chung"
      ] },
    hamster: { name: "Hamster Hạt Dẻ", emoji: "🐹", price: 200,
      lines: [
        "Hạt Dẻ nhét đầy hạt hướng dương vào hai má 🐹",
        "Hạt Dẻ chạy bánh xe vèo vèo không nghỉ",
        "Hạt Dẻ đứng hai chân nhìn {her} chằm chằm",
        "Hạt Dẻ rửa mặt bằng hai tay bé xíu",
        "Hạt Dẻ cuộn tròn ngủ trong hộp khăn giấy"
      ] }
  },

  // Giao diện theo mùa. season = khoảng ngày (tháng-ngày) để tự gợi ý skin hợp dịp lễ.
  skins: [
    { id: "default", name: "Mặc định", icon: "🌸", price: 0, desc: "Tiệm vỉa hè chiều tà tông hồng kem pastel" },
    { id: "valentine", name: "Valentine", icon: "💝", price: 300, desc: "Trái tim hồng, bóng bay, hộp socola trên quầy", season: ["02-01", "02-16"] },
    { id: "trung_thu", name: "Trung Thu", icon: "🏮", price: 300, desc: "Đèn lồng ông sao, đèn cá chép, ánh trăng rằm", season: ["09-01", "10-10"] },
    { id: "tet", name: "Tết", icon: "🧧", price: 350, desc: "Hoa mai vàng, hoa đào, câu đối đỏ", season: ["01-15", "02-25"] },
    { id: "noel", name: "Noel", icon: "🎄", price: 350, desc: "Cây thông nhỏ, dây đèn, tuyết rơi, mũ Noel cho {pet}", season: ["12-01", "12-31"] }
  ],

  // Sổ đánh giá (Mục 25.7): mẫu câu nhận xét chia 3 nhóm theo số sao
  reviewTemplates: {
    good: [
      "Bánh tráng ngon xỉu, bà chủ dễ thương nữa!",
      "Trộn đều tay, vị chua cay vừa miệng, 10 điểm!",
      "Phục vụ nhanh như chớp, chưa kịp lướt điện thoại đã có món.",
      "Khô bò thơm, xoài giòn, ăn một lần là ghiền.",
      "Tiệm xinh xắn, đèn vàng lung linh, chụp hình đẹp lắm.",
      "Giá sinh viên mà chất lượng nhà hàng luôn!",
      "Bà chủ nhớ ý khách ghê, dặn gì làm đúng nấy.",
      "Bánh nướng giòn rụm, trứng béo ngậy, mê!",
      "Trà tắc mát lạnh, uống chung bánh tráng là hết sảy.",
      "Có bé mèo trước quầy siêu dễ thương, ghé hoài luôn.",
      "Ăn xong muốn quay lại liền, mai ghé tiếp nha!",
      "Bánh tráng cuốn bơ béo ngậy, cuốn chặt tay, đỉnh!",
      "Đi ngang mùi thơm quá phải ghé, không hối hận chút nào.",
      "Tiệm ruột của mình từ giờ rồi đó!",
      "Quán sạch sẽ, gọn gàng, bà chủ cười tươi rói.",
      "Phần ăn đầy đặn, topping bỏ không tiếc tay.",
      "Tan học ghé ăn một bịch là quên hết mệt.",
      "Đánh giá 5 sao không cần suy nghĩ!"
    ],
    ok: [
      "Ngon nhưng hôm nay đợi hơi lâu xíu.",
      "Vị ổn, lần sau cho thêm chút sa tế nữa là tuyệt.",
      "Bánh được, mà đông khách quá nên chờ hơi lâu.",
      "Cũng ngon, chắc ghé lại thử món khác.",
      "Món ổn áp, mong quán làm nhanh hơn chút.",
      "Lần đầu bị giao nhầm món, nhưng bà chủ sửa liền nên ok.",
      "Trà hơi nhạt, bánh tráng thì ngon.",
      "Bình thường, không có gì để chê lắm.",
      "Giá ổn, vị ổn, chỗ ngồi hơi chật.",
      "Ngon mà phải đứng chờ hơi mỏi chân.",
      "Được, lần sau mong có thêm ghế ngồi."
    ],
    bad: [
      "Đợi lâu quá nên bỏ về luôn rồi…",
      "Đói xỉu mà chưa tới lượt, buồn ghê.",
      "Đông khách quá, chờ không nổi.",
      "Hôm nay quán làm chậm quá trời.",
      "Đứng chờ mỏi chân mà chưa có món.",
      "Tiếc ghê, nhìn ngon mà không đợi được.",
      "Chắc hôm khác vắng khách mới ghé lại.",
      "Hết giờ nghỉ trưa rồi mà chưa có bánh…",
      "Chờ lâu quá, lần sau phải ghé sớm hơn.",
      "Quán ngon nhưng chờ lâu thì chịu thua.",
      "Bỏ về giữa chừng, tiếc hùi hụi.",
      "Đợi hoài không tới lượt, thôi mua chỗ khác."
    ]
  },
  reviewReplies: [
    "Cảm ơn bạn đã ủng hộ {shop} ạ 💕",
    "Xin lỗi vì để bạn đợi lâu, lần sau quán sẽ làm siêu tốc!",
    "Bà chủ ghi nhận liền, ghé ủng hộ tiếp nha!"
  ],
  reviewKeep: 80,               // giữ tối đa 80 đánh giá gần nhất
  reviewReplyBonusMax: 3,        // trả lời đánh giá ≤ 3 sao → khách sửa thành +1 sao

  // Điểm danh 7 ngày: quà (k) mỗi ngày, kèm lời nhắn dailyCheckinMessages trong personal.js
  checkinRewards: [20, 30, 40, 50, 60, 80, 150],

  // Nhiệm vụ hằng ngày (mỗi ngày thật chọn ngẫu nhiên 3 nhiệm vụ)
  questsPerDay: 3,
  quests: [
    { id: "served", text: "Phục vụ {n} khách", n: 20, reward: 40 },
    { id: "comboMax", text: "Đạt combo x{n} trong một ca", n: 5, reward: 40, best: true },
    { id: "crispy", text: "Nướng giòn {n} bánh (vùng xanh)", n: 3, reward: 50, fromDay: 4 },
    { id: "five", text: "Nhận {n} đánh giá 5 sao", n: 10, reward: 40 },
    { id: "fav", text: "Bán {n} phần món yêu thích", n: 4, reward: 50 },
    { id: "income", text: "Thu về {x} trong một ca", n: 250, reward: 60, best: true, money: true },
    { id: "req", text: "Làm đúng {n} yêu cầu riêng", n: 5, reward: 50, fromDay: 3 },
    { id: "tomo", text: "Phục vụ anh {me} {n} lần", n: 2, reward: 40, fromDay: 3 },
    { id: "days", text: "Hoàn thành {n} ca bán hàng", n: 2, reward: 50 },
    { id: "flirt", text: "Giải {n} câu thính của anh {me}", n: 3, reward: 50, fromDay: 3 }
  ],

  // Sự cố nhỏ trong ca (tối đa 1 lần/ngày)
  incidents: {
    fromDay: 3,
    spillRate: 0.35,             // tỉ lệ có vũng nước đổ trong ngày
    spillAtProgress: [0.25, 0.6],// xuất hiện khi đã có 25–60% số khách
    spillTaps: 3,                // chạm 3 lần để lau
    spillSlow: 0.2               // bếp chậm 20% khi chưa lau
  },

  // Cấp độ & danh hiệu tiệm (Mục 25.12). Kinh nghiệm = doanh thu mỗi ca / 10.
  titles: [
    { name: "Gánh hàng nhỏ", xp: 0 },
    { name: "Tiệm đầu ngõ", xp: 60 },
    { name: "Tiệm quen khu phố", xp: 200 },
    { name: "Tiệm nổi tiếng", xp: 400 },
    { name: "{shop} — Nhất quả đất", xp: 700 }
  ],

  // Toàn bộ chữ hiển thị (Mục 19). {her} {me} {nick} {shop} {pet} lấy từ personal.js.
  texts: {
    loading: "Đang nhóm than cho tiệm {shop}... {p}%",
    loveDays: "Đã bên nhau {n} ngày 💞",
    btnOpenShop: "Mở tiệm",
    btnUpgrade: "Nâng cấp",
    btnMemories: "Kỷ niệm",
    btnReviews: "Đánh giá ⭐",
    btnCheckin: "Điểm danh 🎁",
    btnQuests: "Nhiệm vụ 📋",
    btnSettings: "Cài đặt",
    btnPrepare: "Chuẩn bị mở tiệm",
    btnOpenDay: "Mở cửa bán",
    btnQuickBuy: "Nhập nhanh",
    quickBuyPrice: "(+{q} · {x})",
    btnRetry: "Làm lại ngày",
    btnContinue: "Chơi tiếp",
    btnNextDay: "Ca tiếp",
    btnToMap: "Về bản đồ",
    btnToShop: "Về tiệm",
    btnBuy: "Mua",
    btnClose: "Đóng",
    btnLater: "Để sau",
    btnWelcome: "Vào tiệm thôi!",
    btnLeave: "Rời tiệm",
    btnStay: "Ở lại",
    maxed: "Đã tối đa",
    lacking: "Thiếu {x}",
    target: "Mục tiêu",
    dayN: "Ngày {n}",
    secretDay: "Ca bí mật",
    back: "Quay lại",
    comingSoon: "Góc này {nick} đang xây, bản cập nhật tới sẽ mở cho {her} nha 💕",
    comingSoonShort: "Sắp có rồi nha 💕",
    privateMode: "Chế độ ẩn danh: tiến trình sẽ không được lưu",
    rotate: "Xoay dọc điện thoại để chơi nhé 📱",

    // Bản đồ & Chuẩn bị
    mapTitle: "Bản đồ 15 ngày",
    dayLockedPrev: "Qua Ngày {p} để mở nha",
    dayLockedBuild: "Ngày {n} sẽ mở ở bản cập nhật tới 💕",
    secretLocked: "Qua Ngày 15 để mở Ngày bí mật ★",
    forecast: "{icon} {weather} · Dự kiến {c} khách",
    newDishes: "Món mới: {list}",
    noNewDishes: "Không có món mới",
    prepTitle: "Chuẩn bị · {n}",
    prepStockTitle: "Kho nguyên liệu",
    prepStock: "Tồn: {n} phần",
    prepBuy: "+{q} phần · {x}",
    prepGift: "🎁 Quà khai trương: mỗi nguyên liệu được tặng sẵn {q} phần miễn phí",
    prepWallet: "🪙 Ví: {x}",
    prepRescue: "💌 Bà chủ hết vốn rồi! {nick} gửi tặng nguyên liệu để {her} mở tiệm nè, cố lên nha!",
    prepSpent: "Đã chi nhập hàng: {x}",
    bought: "Đã nhập thêm {q} phần {name}",

    // Trong ca
    hudCustomers: "Khách: {d}/{t}",
    countdown: ["3", "2", "1", "Mở tiệm thôi!"],
    trayEmpty: "Khay trống",
    trayN: "Khay {n}",
    shakeBtn: "Lắc!",
    shakeTitle: "Lắc cho đều nào!",
    shakeHint: "Vuốt qua lại hoặc chạm nhanh {n} lần",
    shakeMeter: "Độ đều",
    shakeDone: "Đã buộc dây thun 🎀",
    noTray: "Hết khay rồi!",
    needBase: "Cho {base} vào trước nha!",
    hasBase: "Bịch này có đế rồi nè",
    trayFull: "Khay đầy rồi!",
    tooMany: "Đủ {ing} rồi nè",
    alreadyTied: "Bịch đã buộc rồi, giao cho khách thôi!",
    afterFinish: "Đã vắt tắc rồi, giờ lắc thôi!",
    finishTwice: "Có {ing} rồi nè",
    notThisZone: "Nguyên liệu này không dùng cho bịch này",
    outOfStock: "Hết {ing} rồi, bấm Nhập nhanh nha!",
    stockEmpty: "Hết",
    zoneLocked: "Khu {zone} mở ở Ngày {n}",
    zoneLaterBuild: "Khu {zone} sẽ có ở bản cập nhật tới 💕",
    pickTrayFirst: "Chọn một bịch đã làm rồi chạm khách để giao nha",
    trayIsEmpty: "Bịch này còn trống mà",
    notArrived: "Đợi khách tới quầy đã nha",
    trashed: "Đã bỏ vào thùng rác",
    trashNothing: "Chọn bịch muốn bỏ trước nha",
    pauseTitle: "Tạm dừng",
    leaveConfirm: "Rời tiệm giữa ca thì ngày này sẽ tính lại từ đầu nha.",
    bookTitle: "Sổ công thức 📖",
    bookBase: "Đế",
    bookToppings: "Topping",
    bookFinish: "Kết thúc",
    bookShake: "Lắc",
    endWin: "Hết khách rồi! Tổng kết thôi 🎉",
    endLose: "Hết tim rồi... 💔",

    // Gợi ý nhanh theo từng khu (hiện ở các ngày có hints: true)
    hints: {
      start: "👆 Chạm Bánh tráng sợi 🍜 để bắt đầu một bịch",
      toppings: "Thêm topping đúng như bong bóng của khách (thứ tự tuỳ ý)",
      finish: "Đủ topping rồi thì vắt Tắc 🍋",
      shake: "Bấm \"Lắc!\" trên bịch để trộn đều",
      deliver: "Chạm bịch rồi chạm khách để giao (hoặc kéo thả bịch lên khách)",
      nuoc_start: "👆 Chạm Ly nhựa 🥤 để bắt đầu một ly",
      nuoc_pour: "Nhấn giữ Bình trà 🫖 (hoặc Nước mía 🎋) 2 giây để rót",
      nuoc_ice: "Chạm Đá 🧊, thêm Tắc 🍋 nếu món có",
      nuoc_deliver: "Chạm ly rồi chạm khách để giao",
      nuong_start: "👆 Chạm Bánh tráng tròn ⚪ để đặt lên vỉ",
      nuong_egg: "Chạm Trứng cút 🥚 rồi nhấn giữ vỉ để tán trứng",
      nuong_cook: "Thêm topping, đợi kim vào vùng xanh rồi chạm vỉ để gấp bánh",
      nuong_sauce: "Chạm sốt Mayonnaise 🥫 hoặc Tương ớt 🔴",
      nuong_deliver: "Chạm vỉ rồi chạm khách để giao",
      cuon_start: "👆 Chạm Bánh tráng phơi sương 📃 để trải ra thớt",
      cuon_toppings: "Thêm nhân đúng như khách gọi rồi bấm \"Cuốn!\"",
      cuon_roll: "Bấm \"Cuốn!\" rồi vuốt từ dưới lên để cuốn bánh",
      cuon_sauce: "Chạm Nước chấm me 🫙",
      cuon_deliver: "Chạm thớt rồi chạm khách để giao"
    },

    // Phản hồi của khách ({Self} = tự xưng viết hoa, {call} = gọi bà chủ)
    wrongNotOrdered: "{Self} đâu có gọi cái này!",
    wrongMissing: "Còn thiếu {ing} nè {call}!",
    wrongExtra: "Ủa, {self} không gọi {ing} mà {call}!",
    wrongNotMixed: "Chưa trộn đều nè!",
    praise: ["Ngon quá!", "Tuyệt cú mèo!", "Bà chủ {her} giỏi ghê!", "Mai ghé nữa nha!", "Đúng vị luôn!", "10 điểm!", "Nhớ ý ghê!"],
    fast: ["Nhanh quá! ⚡", "Siêu tốc!", "Chớp nhoáng!"],
    angry: ["Lâu quá à...", "Thôi đi chỗ khác!", "Đói xỉu rồi 😩"],
    loseLines: ["Không sao, mình làm lại nha {her}! 💪", "Em làm tốt lắm rồi, thử lại ngày này nào!", "Anh {me} tin bà chủ làm được mà ❤️"],
    friendGreet: ["Ghé tiệm {shop} nè!", "Nghe nói tiệm của {her} ngon nhất phố!", "Cho mình như cũ nha {her}!"],

    // Tổng kết
    resultTitle: "Tổng kết · {n}",
    resultPassed: "Qua ca rồi! Bà chủ giỏi quá 🎉",
    resultFailedTarget: "Chưa đạt mục tiêu {x}",
    resultFailedHearts: "Tiệm hết tim mất rồi",
    resultKeep: "Vẫn giữ lại {x} tiền bán được",
    statRevenue: "Doanh thu",
    statTips: "Tiền tip",
    statExpense: "Chi phí nhập hàng",
    statNet: "Lãi ròng",
    statServed: "Số khách phục vụ",
    statRating: "Điểm đánh giá trung bình ngày",
    statIncome: "Tổng thu / Mục tiêu",
    nextDaySoon: "Ngày {n} sẽ mở ở bản cập nhật tới 💕",

    // Màn hình chính
    welcomeTitle: "Chào mừng bà chủ! 💕",
    ownerLabel: "Bà chủ {her}",
    trashLabel: "Thùng rác",
    grillN: "Vỉ {n}",
    grillEmpty: "Vỉ trống",
    rollBtn: "Cuốn!",
    rollTitle: "Cuốn bánh nào!",
    rollHint: "Vuốt từ dưới lên trên bánh tráng để cuốn",
    rollDone: "Cuốn xong rồi 🌯",
    holdToCrack: "Giữ vỉ để tán 🥚",
    needEgg: "Cho trứng cút vào trước rồi tán nha!",
    needCrack: "Nhấn giữ vỉ để tán trứng đã nha",
    needFold: "Đợi gấp bánh xong rồi mới chấm sốt nha",
    alreadyFolded: "Bánh gấp rồi, chỉ còn chấm sốt thôi",
    notCookedYet: "Bánh chưa chín, đợi kim qua vùng vàng nha",
    burntNow: "Ôi cháy mất rồi! Bỏ thùng rác thôi 🔥",
    burntTrash: "Bánh cháy rồi, bỏ thùng rác nha",
    foldGood: "Giòn vừa! ✨",
    foldOk: "Tạm được",
    needRoll: "Cuốn bánh trước rồi mới thêm nước chấm nha",
    alreadyRolled: "Bánh cuốn rồi, giờ thêm nước chấm",
    needToppingRoll: "Thêm nhân trước rồi mới cuốn nha",
    needPour: "Rót trà hoặc nước mía trước nha",
    alreadyPoured: "Ly này rót rồi nè",
    holdToPour: "Nhấn giữ 2 giây để rót",
    pourCancel: "Thả sớm quá, giữ lâu hơn chút nha",
    needCup: "Chạm Ly nhựa trước nha",
    eggInHand: "Đang cầm 1 trứng cút, chạm mèo để cho ăn 🐈",
    catFed: "Mèo được cho ăn, tiệm thêm 1 tim ❤️",
    catLine: "Meo meo~ 🥚",
    catLeave: "Meo...",
    reviewerBadge: "Người review",
    comboLabel: "Combo x{n}",
    loveReady: "Năng lượng yêu thương đầy rồi! Chạm 💖 nha",
    loveActive: "Khách đứng yên chờ {her} nè 💖",
    retryHelp: "Anh giúp em một chút nha 😉",
    requestPraise: "Nhớ ý {self} ghê!",
    partialOk: "Còn món nữa nè!",
    comboName: "Combo Tình Yêu 💕",
    wrongNotRolled: "Chưa cuốn bánh nè {call}!",
    wrongNotCooked: "Bánh chưa nướng xong nè!",
    wrongBurnt: "Bánh cháy đen rồi {call} ơi!",
    wrongNotCrispy: "{Self} dặn nướng giòn mà!",
    groupArrive: "Học sinh tan trường kéo tới nè! 🎒",
    weatherChip: "{icon} {label}",
    zoneHeader: "{icon} Khu {name}",
    secretSoon: "Ngày bí mật sẽ mở ở bản cập nhật tới 💕",
    dayNames: { secret: "bí mật" },
    runMs: "Mốc {n}",
    runSecret: "Ca bí mật",
    runDaily: "Thử thách hôm nay",
    runEndless: "Ca vô tận",
    msGain: "+{u} ca",
    msProgress: "{a} / {b} ca",
    msCleared: "Qua {t}! 🎉",
    msMinorCoins: "Thưởng qua mốc: +{x}",
    msTaleTitle: "Chuyện vặt 💬",
    // Khách Hiếu (Tomortle)
    tomoTag: "{nick} 💕",
    tomoAsk: "{Her} còn nhớ \"{title}\" không?",
    tomoReplies: ["Nhớ chứ, sao mà quên được 💕", "Nhớ hoài luôn, anh hỏi chi vậy 😳"],
    tomoAnswers: ["Anh cũng vậy, nhớ từng chút một luôn ❤️ (+5k tip)", "Tại anh thương em quá nên hỏi hoài đó 😚 (+1 tim tiệm)"],
    tomoThanks: "Ngon nhất quả đất luôn! Cảm ơn bà chủ {her} 💕",
    // Khách quen
    // Anh Hiếu thả thính
    flirtGreet: "Bà chủ ơi, anh không mua gì đâu, anh ghé thả thính bà chủ thôi 💕",
    flirtTitle: "{nick} thả thính 💕",
    flirtPlaceholder: "Gõ ý thật của câu này vào đây…",
    flirtSubmit: "Trả lời",
    flirtGiveUp: "Chịu, anh nói đi",
    flirtEmpty: "Gõ gì đó đi bé ơi 😏",
    flirtWrong: "Chưa đúng ý anh rồi, đoán lại nha bé 😚",
    flirtRight: "Đúng ý anh luôn! Bé thông minh quá 💕",
    flirtReveal: "Ý anh là: {a} 😚",
    flirtBookTitle: "Sổ thính của {nick} 💕",
    flirtBookCount: "Sổ thính · đã giải {a}/{b}",
    flirtLocked: "Chưa gặp câu này",
    flirtByHim: "anh nói",
    regularOrder: "{Call} ơi, cho {self} {dish} như mọi khi nha!",
    regularTitle: "{name} · Chương {c}/{t}",
    regularLoyal: "{name} trở thành Khách ruột ❤️ của tiệm!",
    effTip: "+{x} tip 💰",
    effWallet: "+{x} vào ví 🪙",
    effCustomer: "Ngày mai có thêm 1 khách ghé tiệm 👥",
    effDecor: "Nhận quà trang trí: {name} 🎁",
    effHeart: "+1 tim tiệm ❤️",
    // Kỷ niệm
    envelopeTap: "Có thư nè! Chạm để mở ✉️",
    memoryLocked: "Qua Ngày {n} để mở",
    albumTitle: "Kỷ niệm 💌",
    albumCount: "Đã mở {a}/{b} thẻ",
    goldHearts: "💛 {a}/{b}",
    bonusTitle: "Lời nhắn bí mật 💛",
    bonusCard: "💛 Lời nhắn bí mật",
    bonusLocked: "Đạt 3 sao cả 15 ngày để mở lời nhắn bí mật",
    goldHeartGet: "Nhận 1 Trái tim vàng 💛",
    btnOpenLetter: "Mở thư",
    btnSurprise: "Xem bất ngờ 💝",
    tapToSkip: "Chạm để xem tiếp",
    endingTogether: "Đã bên nhau {n} ngày. Và còn nhiều nữa 💞",
    specialDayBanner: "Chúc mừng kỷ niệm của {nick} & Sarose! 🎉",
    secretInfo: "Chỉ có anh {me} và nhóm bạn ghé chơi. Không thể thua 💕",
    noTarget: "Không giới hạn",
    secretResult: "Một ngày bán hàng thật vui cùng mọi người 💕",
    // Cửa hàng
    shopTitle: "Cửa hàng 🛍️",
    shopTabEquip: "Thiết bị",
    shopTabDecor: "Trang trí & Thú cưng",
    shopTabSkin: "Giao diện mùa",
    shopBuyPrice: "Mua · {x}",
    shopOwned: "Đã có",
    shopUse: "Dùng",
    shopInUse: "Đang dùng",
    shopLevel: "Cấp {a}/{b}",
    shopBought: "Đã mua {name}! 🎉",
    shopDecorTitle: "Trang trí tiệm",
    shopPetTitle: "Thú cưng",
    shopSuggest: "Đang mùa {name} nè! Thử giao diện {icon} cho tiệm nha",
    shopDefaultPet: "Bé mèo cam của tiệm",
    // Đánh giá
    reviewTitle: "Sổ đánh giá ⭐",
    reviewAvg: "Điểm trung bình tiệm",
    reviewCount: "{n} đánh giá",
    reviewEmpty: "Chưa có đánh giá nào. Mở tiệm bán hàng để nhận đánh giá nha!",
    reviewReply: "Trả lời",
    reviewReplyTitle: "Bà chủ trả lời",
    reviewReplied: "Bà chủ: {text}",
    reviewFixed: "Khách vui vẻ sửa lại thành {n} sao 💕",
    reviewDay: "Ngày {n}",
    // Sự cố
    spillAppear: "Ối, nước đổ trước quầy! Chạm 3 lần để lau nha 💦",
    spillClean: "Lau sạch rồi! ✨",
    // Điểm danh & nhiệm vụ
    checkinTitle: "Quà điểm danh 7 ngày 🎁",
    checkinDay: "Ngày {n}",
    checkinClaim: "Nhận quà hôm nay",
    checkinDone: "Hôm nay nhận rồi, mai quay lại nha 💕",
    checkinGot: "+{x} vào ví 🪙",
    questTitle: "Nhiệm vụ hôm nay 📋",
    questClaim: "Nhận",
    questClaimed: "Đã nhận",
    questProgress: "{a}/{b}",
    questReward: "+{x}",
    questDone: "Hoàn thành nhiệm vụ! +{x} 🪙",
    // Cấp độ
    levelLabel: "Cấp {n}",
    levelUp: "Tiệm lên cấp {n}: {title}! 🎉",
    // Cài đặt
    settingsTitle: "Cài đặt ⚙️",
    setMusic: "Nhạc nền",
    setSfx: "Âm thanh",
    setVibrate: "Rung",
    setFullscreen: "Toàn màn hình",
    setHowTo: "Cách chơi 📖",
    setBackup: "Sao lưu & Khôi phục 💾",
    setWipe: "Xoá dữ liệu",
    backupTitle: "Sao lưu & Khôi phục 💾",
    backupCopy: "Sao chép mã sao lưu",
    backupCopied: "Đã sao chép mã! Dán vào Ghi chú hoặc gửi qua email để cất giữ nha 💾",
    backupCopyManual: "Nhấn giữ vào ô mã để chọn tất cả rồi sao chép nha",
    backupWarn: "Đừng gửi mã qua Messenger hoặc Zalo vì tin nhắn dài có thể bị cắt.",
    backupPaste: "Dán mã để khôi phục",
    backupPlaceholder: "Dán mã TIEM1-… vào đây",
    backupRestore: "Khôi phục",
    backupConfirm: "Tiến trình hiện tại sẽ được thay bằng tiến trình trong mã. Khôi phục nhé?",
    backupDone: "Khôi phục xong rồi! 🎉",
    backupBad: "Mã không đúng hoặc bị cắt mất một phần, kiểm tra lại nha",
    backupUnsupported: "Trình duyệt này chưa đọc được mã nén, thử mở bằng Chrome hoặc Safari mới hơn nha",
    wipeConfirm1: "Xoá toàn bộ tiến trình, tiền, kỷ niệm đã mở… và chơi lại từ đầu?",
    wipeConfirm2: "Chắc chắn chưa? Xoá rồi là không lấy lại được đâu (trừ khi có mã sao lưu).",
    wipeYes: "Xoá hết",
    wipeYes2: "Chắc chắn, xoá!",
    cancel: "Thôi",
    updateReady: "Có bản cập nhật mới, tải lại trang để dùng nha ✨",
    on: "Bật",
    off: "Tắt",
    // Bộ 7 thẻ "Cách chơi"
    howtoTitle: "Cách chơi",
    howtoNext: "Tiếp",
    howtoPrev: "Trước",
    howtoStart: "Bắt đầu thôi!",
    howto: [
      { icon: "🥗", title: "Mỗi ngày một ca bán hàng", text: "{her} mở tiệm {shop} 15 ngày. Mỗi ngày có số khách cố định và một mục tiêu doanh thu — phục vụ hết khách, đạt mục tiêu là qua ngày!" },
      { icon: "📦", title: "Chuẩn bị đầu ngày", text: "Xem dự báo thời tiết, sự kiện rồi nhập nguyên liệu. Trong ca hết hàng thì bấm \"Nhập nhanh\" (giá gấp đôi)." },
      { icon: "🥣", title: "Làm món đúng thứ tự", text: "Đế đặt trước (bánh tráng, ly…) → topping theo bong bóng của khách, thứ tự tuỳ ý → bước kết thúc làm sau cùng (lắc, gấp, cuốn, rót…)." },
      { icon: "👆", title: "4 kiểu thao tác", text: "Chạm để thêm nguyên liệu · Nhấn giữ để rót nước, tán trứng · Vuốt qua lại để lắc bịch, vuốt lên để cuốn · Canh kim vào vùng xanh rồi chạm vỉ để gấp bánh." },
      { icon: "🥰", title: "Giao món cho khách", text: "Chạm khay rồi chạm khách, hoặc kéo thả khay lên khách. Giao nhanh khi thanh kiên nhẫn còn xanh để được nhiều tiền và 5 sao!" },
      { icon: "❤️", title: "Tim, combo & chiêu đặc biệt", text: "Khách bỏ đi mất 1 tim, hết 3 tim là thua ngày. Giao đúng liên tiếp được combo. Từ Ngày 6, chạm 💖 để khách đứng yên 8 giây. Dòng chữ cam là yêu cầu riêng, làm đúng được thêm tip." },
      { icon: "💌", title: "Quà từ {nick}", text: "Qua mỗi ngày mở một thẻ kỷ niệm. Đạt 3 sao nhận Trái tim vàng 💛. Thắng hết 15 ngày sẽ có một bất ngờ đang chờ {her} đó!" }
    ],
    // Hướng dẫn tương tác
    tutSkip: "Bỏ qua",
    tutNext: "Hiểu rồi",
    tutDone: "Giỏi quá! Giờ {her} tự làm nha 💕",
    tut: {
      bubble: "Khách gọi món ở đây: món, nguyên liệu và thanh kiên nhẫn. Khi hướng dẫn, khách sẽ chờ {her} nha!",
      tabNuoc: "Khách gọi nước nè! Chạm tab 🧋 Nước (hoặc vuốt ngang khu nguyên liệu) để sang Quầy nước",
      tabNuong: "Khách gọi bánh nướng! Chạm tab 🔥 Nướng để sang Bếp nướng",
      tabCuon: "Khách gọi bánh cuốn! Chạm tab 🌯 Cuốn để sang Quầy cuốn",
      base: "Chạm {name} để bắt đầu",
      toppings: "Chạm các topping giống trong bong bóng của khách (thứ tự tuỳ ý)",
      tac: "Đủ topping rồi, vắt Tắc 🍋 nha",
      shakeBtn: "Bấm \"Lắc!\" để trộn đều",
      shakeZone: "Vuốt qua lại (hoặc chạm nhanh) cho thanh Độ đều đầy",
      deliver: "Chạm khay rồi chạm khách để giao (hoặc kéo thả khay lên khách)",
      pour: "Nhấn giữ Bình trà 🫖 (hoặc Nước mía 🎋) đến khi vòng tròn đầy",
      ice: "Chạm Đá 🧊, rồi thêm Tắc 🍋 nếu món có",
      egg: "Chạm Trứng cút 🥚 để đập trứng lên bánh",
      crack: "Nhấn giữ vỉ nướng đến khi vòng tròn đầy để tán trứng",
      grillTop: "Thêm topping khi kim còn ở vùng xám",
      fold: "Đợi kim chạy vào vùng XANH rồi chạm vỉ để gấp bánh",
      sauce: "Chạm sốt Mayonnaise 🥫 hoặc Tương ớt 🔴 theo món",
      rollBtn: "Bấm \"Cuốn!\" để cuốn bánh",
      rollZone: "Vuốt từ dưới lên trên bánh tráng",
      dip: "Chạm Nước chấm me 🫙"
    },
    stepNames: { lac: "💫 Lắc", nuong: "🔥 Canh lửa", gap: "🫓 Gấp bánh", cuon: "🌯 Cuốn", "rot:tra": "🫖 Rót trà (giữ 2 giây)", "rot:nuoc_mia": "🎋 Rót nước mía (giữ 2 giây)" },
    zonePrev: "Khu trước",
    zoneNext: "Khu sau",
    loveLabel: "Năng lượng yêu thương",
    footer: "Làm bằng cả trái tim bởi {me} ({nick}) dành tặng {her} ❤️",
    embeddedBrowser: "Mở bằng Safari hoặc Chrome để chơi mượt và lưu tiến trình tốt hơn nhé 💕"
  }
};
