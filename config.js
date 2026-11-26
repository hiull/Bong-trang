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
    playableZones: ["tron", "nuong", "cuon", "nuoc", "che"],
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
    fontWaitMaxSec: 1.2,
    bootMinSec: 0.4,
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
          ] },
        { fromLevel: 16, text: "Thấy tiệm có quầy chè là chị mừng ghê! Văn phòng chị chiều nào cũng thèm đồ ngọt mà ngại đi xa.",
          choices: [
            { label: "Chị đặt luôn cho cả phòng, em làm liền!", effect: { customer: 1 } },
            { label: "Chị thử chè thập cẩm nha, em xếp kỹ lắm", effect: { tip: 5 } }
          ] },
        { fromLevel: 16, text: "Chị được thăng chức rồi em ơi! Bữa nay chị bao cả phòng ăn chè.",
          choices: [
            { label: "Chúc mừng chị! Em tặng chị thêm trân châu", effect: { tip: 8 } },
            { label: "Chị nhớ đừng tăng ca nhiều nữa nha", effect: { customer: 1 } }
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
          ] },
        { fromLevel: 16, text: "Trời nóng chạy xe mệt quá con ơi. Có ly chè đá là chú sống lại liền.",
          choices: [
            { label: "Con làm chè sương sáo mát nhất cho chú!", effect: { tip: 5 } },
            { label: "Chú ngồi nghỉ xíu, con rót trà đá cho", effect: { customer: 1 } }
          ] },
        { fromLevel: 16, text: "Út Mai cháu chú nghỉ hè lên chơi, nó đòi ăn sữa chua mít của tiệm con hoài.",
          choices: [
            { label: "Con làm hai ly, một ly tặng bé Út!", effect: { tip: 6 } },
            { label: "Chú dắt bé ghé tiệm chơi nha", effect: { customer: 1 } }
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
          ] },
        { fromLevel: 16, text: "Chị ơi em thi xong rồi! Em được giải nhì văn toàn thành phố đó!",
          choices: [
            { label: "Giỏi quá trời! Chị mời Na ly chè ba màu", effect: { tip: 5 } },
            { label: "Kể chị nghe đề thi đi Na", effect: { customer: 1 } }
          ] },
        { fromLevel: 16, text: "Em sắp lên đại học rồi. Chị cho em xin công thức chè để nhớ tiệm nha.",
          choices: [
            { label: "Chị chép cho em liền, nhớ về thăm chị", effect: { tip: 8 } },
            { label: "Học xa cũng phải ăn uống đầy đủ đó", effect: { customer: 1 } }
          ] }
      ] },
    co_hanh: {
      name: "Cô giáo Hạnh", avatar: "👩‍🏫", doodle: "co_hanh", self: "cô", call: "em", dish: "che_dau_do",
      patience: 30, tip: [3, 5], startDay: 17, gap: 2,
      chapters: [
        { fromLevel: 17, text: "Cô dạy ở trường cấp hai đầu hẻm. Chấm bài mệt quá, cô ghé ăn ly chè cho tỉnh.",
          choices: [
            { label: "Cô ăn chè đậu đỏ nha, em làm ngọt vừa", effect: { tip: 5 } },
            { label: "Cô chấm bài ở đây cũng được, tiệm mát lắm", effect: { customer: 1 } }
          ] },
        { fromLevel: 21, text: "Học trò cô hỏi tiệm chè nào ngon, cô chỉ tiệm em đó. Mai tụi nó kéo nhau tới.",
          choices: [
            { label: "Em cảm ơn cô nhiều lắm!", effect: { customer: 1 } },
            { label: "Em sẽ làm chè ba màu thật đẹp cho tụi nhỏ", effect: { tip: 5 } }
          ] },
        { fromLevel: 26, text: "Cô sắp nghỉ hưu rồi. Ngày cuối cô muốn ăn chè ba màu, giống hồi cô còn đi học.",
          choices: [
            { label: "Em làm ly đặc biệt nhất cho cô", effect: { tip: 10 } },
            { label: "Cô nghỉ hưu nhớ ghé tiệm thường xuyên nha", effect: { customer: 1 } }
          ] }
      ] }
  },

  // 4 khu làm món (Mục 7.1)
  zones: [
    { id: "tron", icon: "🥣", name: "Trộn", openDay: 1, container: "Bịch nilon" },
    { id: "nuong", icon: "🔥", name: "Nướng", openDay: 4, container: "Vỉ nướng" },
    { id: "cuon", icon: "🌯", name: "Cuốn", openDay: 7, container: "Thớt tre" },
    { id: "nuoc", icon: "🧋", name: "Nước", openDay: 2, container: "Ly nhựa" },
    { id: "che", icon: "🍧", name: "Chè", openDay: 16, container: "Cốc chè" }
  ],

  // Vai trò nguyên liệu theo khu: đế (cho đầu tiên) / kết thúc (cho sau cùng)
  zoneRoles: {
    tron: { base: ["bt_soi"], finish: ["tac"] },
    nuong: { base: ["bt_tron"], finish: ["mayo", "tuong_ot"] },
    cuon: { base: ["bt_phoi_suong"], finish: ["nuoc_cham"] },
    nuoc: { base: ["ly"], finish: ["tra", "nuoc_mia", "da"] },
    che: { base: ["coc_che"], finish: ["da", "dua_nao"] }
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
    da:            { name: "Đá",                      short: "đá",             emoji: "🧊", zones: ["nuoc", "che"], openDay: 2, price: 1 },
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
    tran_chau:     { name: "Trân châu",               short: "trân châu",      emoji: "⚫", zones: ["nuoc", "che"], openDay: 11, price: 6 },
    // Quầy chè (Mùa 2). color = màu dải lớp trong cốc.
    coc_che: { name: "Cốc chè", short: "cốc", emoji: "🥃", zones: ["che"], openDay: 16, price: 2, color: "#F3E5D8" },
    dau_xanh: { name: "Đậu xanh", short: "đậu xanh", emoji: "🟢", zones: ["che"], openDay: 16, price: 5, color: "#E8D27A" },
    sua_chua: { name: "Sữa chua", short: "sữa chua", emoji: "🥛", zones: ["che"], openDay: 16, price: 8, color: "#FFF8EE" },
    nuoc_cot_dua: { name: "Nước cốt dừa", short: "nước cốt dừa", emoji: "🥥", zones: ["che"], openDay: 16, price: 6, color: "#FFFDF5" },
    dau_do: { name: "Đậu đỏ", short: "đậu đỏ", emoji: "🫘", zones: ["che"], openDay: 17, price: 5, color: "#A2453B" },
    suong_sao: { name: "Sương sáo", short: "sương sáo", emoji: "🌑", zones: ["che"], openDay: 18, price: 5, color: "#3B3030" },
    mit: { name: "Mít", short: "mít", emoji: "🍈", zones: ["che"], openDay: 19, price: 10, color: "#F6C445" },
    thach: { name: "Thạch rau câu", short: "thạch", emoji: "💠", zones: ["che"], openDay: 20, price: 6, color: "#7FD1C7" },
    nep_cam: { name: "Nếp cẩm", short: "nếp cẩm", emoji: "🟣", zones: ["che"], openDay: 21, price: 7, color: "#6B2E5C" },
    dua_nao: { name: "Dừa nạo", short: "dừa nạo", emoji: "☁️", zones: ["che"], openDay: 24, price: 6, color: "#FFFFFF" }
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
      toppings: [], finish: [], combo: ["bt_tron_kho_bo", "tra_tac"], price: 60, openDay: 14 },
    // Quầy chè (Mùa 2): toppings = các LỚP theo đúng thứ tự từ dưới lên; finish = lớp phủ.
    { id: "che_dau_xanh", name: "Chè đậu xanh", short: "Chè đậu xanh", emoji: "🍧", zone: "che", base: "coc_che",
      toppings: ["dau_xanh", "nuoc_cot_dua"], finish: ["da"], price: 15, openDay: 16 },
    { id: "sua_chua_da", name: "Sữa chua đá", short: "Sữa chua đá", emoji: "🍦", zone: "che", base: "coc_che",
      toppings: ["sua_chua"], finish: ["da"], price: 12, openDay: 16 },
    { id: "che_dau_do", name: "Chè đậu đỏ", short: "Chè đậu đỏ", emoji: "🍧", zone: "che", base: "coc_che",
      toppings: ["dau_do", "nuoc_cot_dua"], finish: ["da"], price: 15, openDay: 17 },
    { id: "che_suong_sao", name: "Chè sương sáo", short: "Chè sương sáo", emoji: "🍧", zone: "che", base: "coc_che",
      toppings: ["suong_sao", "nuoc_cot_dua"], finish: ["da"], price: 15, openDay: 18 },
    { id: "sua_chua_mit", name: "Sữa chua mít", short: "Sữa chua mít", emoji: "🍦", zone: "che", base: "coc_che",
      toppings: ["mit", "sua_chua"], finish: ["da"], price: 20, openDay: 19 },
    { id: "che_thap_cam", name: "Chè thập cẩm", short: "Chè thập cẩm", emoji: "🍧", zone: "che", base: "coc_che",
      toppings: ["dau_xanh", "dau_do", "thach", "nuoc_cot_dua"], finish: ["da"], price: 25, openDay: 20 },
    { id: "sua_chua_nep_cam", name: "Sữa chua nếp cẩm", short: "SC nếp cẩm", emoji: "🍦", zone: "che", base: "coc_che",
      toppings: ["nep_cam", "sua_chua"], finish: ["da"], price: 22, openDay: 21 },
    { id: "che_thai", name: "Chè Thái", short: "Chè Thái", emoji: "🍧", zone: "che", base: "coc_che",
      toppings: ["mit", "thach", "tran_chau", "nuoc_cot_dua"], finish: ["da"], price: 28, openDay: 22 },
    { id: "sua_chua_tran_chau", name: "Sữa chua trân châu", short: "SC trân châu", emoji: "🍦", zone: "che", base: "coc_che",
      toppings: ["tran_chau", "sua_chua"], finish: ["da"], price: 20, openDay: 23 },
    { id: "che_dua_non", name: "Chè dừa non", short: "Chè dừa non", emoji: "🍧", zone: "che", base: "coc_che",
      toppings: ["thach", "nuoc_cot_dua"], finish: ["dua_nao", "da"], price: 22, openDay: 24 },
    { id: "che_ba_mau", name: "Chè ba màu", short: "Chè ba màu", emoji: "🍧", zone: "che", base: "coc_che",
      toppings: ["dau_do", "dau_xanh", "thach", "nuoc_cot_dua"], finish: ["da"], price: 25, openDay: 25 },
    { id: "sua_chua_dua", name: "Sữa chua dừa", short: "Sữa chua dừa", emoji: "🍦", zone: "che", base: "coc_che",
      toppings: ["sua_chua", "nuoc_cot_dua"], finish: ["dua_nao"], price: 22, openDay: 26 },
    { id: "che_dac_biet", name: "Chè đặc biệt", short: "Chè đặc biệt", emoji: "🍧", zone: "che", base: "coc_che",
      toppings: ["dau_xanh", "nep_cam", "mit", "thach", "tran_chau", "nuoc_cot_dua"], finish: ["dua_nao", "da"], price: 38, openDay: 28 },
    { id: "ly_che_hen_ho", name: "Ly Chè Hẹn Hò", short: "Chè Hẹn Hò", emoji: "🍧", zone: "che", base: "coc_che",
      toppings: ["sua_chua", "mit", "tran_chau", "nuoc_cot_dua"], finish: ["dua_nao"], price: 45, openDay: 30 },
    { id: "combo_mua_he", name: "Combo Mùa Hè", short: "Combo Mùa Hè", emoji: "🌴", zone: "combo", base: null,
      toppings: [], finish: [], combo: ["che_thai", "tra_tac"], price: 40, openDay: 27 }
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
    7: { zone: "cuon", key: "day7" },
    16: { zone: "che", key: "day16" }
  },

  // Yêu cầu riêng của khách (Mục 7.4)
  specialRequests: [
    { id: "no_rau_ram", type: "remove", ing: "rau_ram", text: "không rau răm" },
    { id: "no_xoai", type: "remove", ing: "xoai", text: "không xoài" },
    { id: "no_hanh_phi", type: "remove", ing: "hanh_phi", text: "không hành phi" },
    { id: "it_da", type: "remove", ing: "da", text: "ít đá" },
    { id: "them_trung", type: "double", ing: "trung_cut", text: "thêm trứng cút" },
    { id: "nhieu_kho_bo", type: "double", ing: "kho_bo", text: "nhiều khô bò" },
    { id: "no_nuoc_cot", type: "remove", ing: "nuoc_cot_dua", text: "không nước cốt dừa", zone: "che" },
    { id: "nhieu_tran_chau", type: "double", ing: "tran_chau", text: "nhiều trân châu", zone: "che" },
    { id: "nhieu_mit", type: "double", ing: "mit", text: "nhiều mít", zone: "che" },
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
    secret:   { icon: "★", label: "Ca bí mật", note: "Không thể thua" }
  },

  // Mùa & mốc: 15 ngày bên dưới là 15 mốc lớn; giữa các mốc lớn có mốc nhỏ (minorPerMajor).
  seasons: [
    { id: 1, name: "Mùa 1 · Tiệm nhỏ đầu hẻm", majorDays: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], minorPerMajor: 1 },
    { id: 2, name: "Mùa 2 · Quầy chè đầu hẻm", majorDays: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30], minorPerMajor: 1 }
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

  // Thử thách mỗi ngày: mở từ mốc fromMilestone. Hạng theo thu/mục tiêu: [bạc, vàng]; thưởng đồng/bạc/vàng (k).
  daily: {
    fromMilestone: 5,
    tierRatios: [0.8, 1.2],
    tierCoins: [30, 60, 100],
    focusWeight: 3,             // món chủ đạo được gọi nhiều gấp chừng này
    rules: [
      { id: "rush", label: "Khách vội", patienceMult: 0.8 },
      { id: "regulars", label: "Bạn bè rủ nhau ghé", friendMult: 5 },
      { id: "hieu5", label: "Anh Hiếu ghé 5 lần", tomoVisits: 5 },
      { id: "picky", label: "Tip gấp đôi nhưng khách khó tính", tipMult: 2, patienceMult: 0.85 },
      { id: "crowd", label: "Đông khách", extraCustomers: 3 },
      { id: "che_day", label: "Ngày chè", cheDay: true, fromLevel: 16 },
      { id: "hieu_busy", label: "Anh Hiếu bận (thưởng +50%)", helperOff: true, tipMult: 1.5, fromLevel: 18 }
    ]
  },

  // Huy hiệu: stat = chỉ số theo dõi, n = mốc cần đạt, reward = thưởng (k)
  badges: [
    { id: "served50", name: "Tay mới vào nghề", desc: "Phục vụ 50 khách", stat: "served", n: 50, reward: 30 },
    { id: "served500", name: "Bà chủ đắt khách", desc: "Phục vụ 500 khách", stat: "served", n: 500, reward: 100 },
    { id: "perfect5", name: "Không ai phải chờ", desc: "5 ca không khách nào bỏ đi", stat: "perfect", n: 5, reward: 50 },
    { id: "crispy30", name: "Vua bếp nướng", desc: "Nướng giòn 30 bánh", stat: "crispy", n: 30, reward: 50 },
    { id: "flirt10", name: "Bắt thính siêu đỉnh", desc: "Giải 10 câu thính", stat: "flirt", n: 10, reward: 80 },
    { id: "daily7", name: "Một tuần chăm chỉ", desc: "Chuỗi Thử thách 7 ngày", stat: "dailyStreak", n: 7, reward: 80 },
    { id: "endless100", name: "Không biết mệt", desc: "Ca vô tận phục vụ 100 khách", stat: "endlessBest", n: 100, reward: 100 },
    { id: "season1", name: "Tiệm nhỏ đầu hẻm", desc: "Đi hết Mùa 1", stat: "season1", n: 1, reward: 150 },
    { id: "season2", name: "Quầy chè đầu hẻm", desc: "Đi hết Mùa 2", stat: "season2", n: 1, reward: 200 },
    { id: "vip3", name: "Khách sộp", desc: "Phục vụ 3 khách đặc biệt", stat: "vips", n: 3, reward: 60 },
    { id: "custom5", name: "Đầu bếp sáng tạo", desc: "Bán 5 phần món sáng tạo", stat: "customs", n: 5, reward: 60 },
    { id: "rush10", name: "Bình tĩnh giờ cao điểm", desc: "Vượt 10 đợt giờ cao điểm", stat: "rushes", n: 10, reward: 60 },
    { id: "date5", name: "Hẹn hò ăn ý", desc: "Thắng 5 lần hẹn hò sau ca", stat: "dates", n: 5, reward: 80 },
    { id: "gold15", name: "Tim vàng trọn vẹn", desc: "Đủ 15 Tim vàng Mùa 1", stat: "gold", n: 15, reward: 150 }
  ],
  // Tuỳ chọn "Công thức chuẩn ngoài đời" (Cài đặt): ghi đè nguyên liệu cho gần cách bán ở các xe
  // bánh tráng Sài Gòn. Nguyên liệu thêm vào chỉ bị đòi khi đã mở ở cấp của ca. Giá món giữ nguyên.
  // Nước và chè giữ nguyên vì đã giống ngoài đời.
  realRecipes: {
    bt_tron_co_ban:   { toppings: ["xoai", "rau_ram", "dau_phong", "hanh_phi", "sa_te", "muoi_tom"] },
    bt_tron_kho_bo:   { toppings: ["kho_bo", "trung_cut", "xoai", "rau_ram", "dau_phong", "hanh_phi", "sa_te"] },
    bt_tron_hanh_phi: { toppings: ["trung_cut", "hanh_phi", "rau_ram", "dau_phong", "muoi_tom", "sa_te"] },
    bt_tron_kho_muc:  { toppings: ["kho_muc", "trung_cut", "xoai", "rau_ram", "sa_te", "dau_phong", "hanh_phi"] },
    bt_bo:            { toppings: ["bo_beo", "muoi_tom", "hanh_phi", "rau_ram"], finish: ["tac", "lac"] },
    bt_tron_dac_biet: { toppings: ["kho_bo", "kho_muc", "tom_kho", "trung_cut", "xoai", "rau_ram", "dau_phong", "hanh_phi", "sa_te"] },
    bt_nuong_trung:   { toppings: ["trung_cut", "hanh_la", "hanh_phi"], finish: ["nuong", "gap", "mayo", "tuong_ot"] },
    bt_nuong_xuc_xich:{ toppings: ["trung_cut", "xuc_xich", "hanh_la", "cha_bong"], finish: ["nuong", "gap", "mayo", "tuong_ot"] },
    bt_nuong_pho_mai: { toppings: ["trung_cut", "pho_mai", "xuc_xich", "hanh_la", "cha_bong"], finish: ["nuong", "gap", "mayo", "tuong_ot"] },
    bt_cuon_bo:       { toppings: ["bo_beo", "muoi_tom", "cha_bong", "kho_bo", "rau_ram"], finish: ["cuon"] }
  },

  // Màn "Có gì mới": save cũ thấy một lần mỗi khi đổi version. go = nút "Thử ngay" mở đâu.
  whatsNew: {
    version: "2.0",
    items: [
      { icon: "💕", title: "Anh Hiếu sửa món", text: "Lỡ giao sai, anh Hiếu làm lại hoặc bỏ nốt phần thiếu; khách sắp bỏ đi anh tự làm giúp; bấm nút có hình anh trên đầu màn để nhờ làm món cho khách bất kỳ. Khách bớt tip một chút. Tắt trong Cài đặt → Trợ giúp.", go: null },
      { icon: "📖", title: "Bếp tập", text: "Tập làm bất kỳ món nào: không khách thật, không tính giờ, không tốn nguyên liệu. Nút Bếp tập ở Menu.", go: "practice" },
      { icon: "✅", title: "Mục tiêu phụ", text: "Mỗi mốc có thêm một mục tiêu nhỏ (không ai bỏ đi, combo 5…). Đạt được thì có dấu ✓ trên Bản đồ và thưởng 20k.", go: "map" },
      { icon: "🔮", title: "Tarot", text: "Bùa giờ là lá Ẩn chính: qua mốc lớn được lật 3 lá úp rồi chọn một. Mỗi ngày còn có Lá bài hôm nay trong Sổ tay.", go: "perks" },
      { icon: "🎵", title: "Nhịp lắc & tủ giữ món", text: "Lắc đúng lúc vòng tròn khép lại, hoặc cuốn liền một hơi, được Ngon tuyệt! và thêm tip. Từ cấp 6 có tủ để làm sẵn món trước giờ đông.", go: null },
      { icon: "📱", title: "Đơn mang về & đơn sỉ", text: "Từ cấp 8 có đơn mang về chờ tài xế, từ cấp 10 có đơn sỉ nhiều phần. Chỉnh mức trong Cài đặt → Sự kiện.", go: "settings" }
    ]
  },

  // Anh Hiếu tự sửa món làm sai: số lượt mỗi ca, thời gian làm lại, tip còn lại, kiên nhẫn giữ tối thiểu
  // perShift 0 = không giới hạn (anh làm lần lượt). topUp = bỏ thêm 1–2 phần còn thiếu (nhanh hơn, bớt ít tip hơn). rescueAt = khách dưới mức kiên nhẫn này thì anh tự làm giúp
  heroFix: { perShift: 0, sec: 2.5, tipMult: 0.5, topUpSec: 1.2, topUpTipMult: 0.75, keepPatience: 0.3, rescueAt: 0.15, rescuePerShift: 2, relaxRescuePerShift: 5 },
  // Đơn mang về (kiểu đặt qua app): từ cấp fromLevel; số đơn mỗi ca (cấp ≥ moreFromLevel thì 2); xuất hiện ở tiến độ window;
  // chờ tài xế sec giây; giao đủ được tiền món + fee (k); trễ thì mất đơn, không mất tim
  takeout: { fromLevel: 8, moreFromLevel: 12, window: [0.2, 0.75], sec: [60, 80], items: [2, 3], fee: 10 },
  // Đơn sỉ: từ cấp fromLevel, xác suất rate mỗi ca; qty phần cùng một món trộn/chè; tiền ×qty×mult; khách chờ lâu gấp patienceMult
  bulk: { fromLevel: 10, rate: 0.6, qty: [4, 6], mult: 1.15, at: [0.35, 0.7], patienceMult: 2, zones: ["tron", "che"] },

  // Tủ giữ món: từ cấp fromLevel, slots ô; để quá staleSec giây thì nguội (trừ 1 sao)
  hold: { fromLevel: 6, slots: 2, staleSec: 40 },
  // Nhịp lắc/cuốn: vòng nhịp chu kỳ period giây; chạm trong ±window (tỉ lệ chu kỳ) là trúng; trúng ≥ needRatio số lần lắc → Ngon tuyệt! (+tip k)
  rhythm: { period: 0.8, window: 0.18, needRatio: 0.6, tip: 3 },

  // Bùa: qua mốc lớn lần đầu chọn 1 trong 3 bùa chưa có; giữ mãi
  // Bùa = lá Ẩn chính (Major Arcana) của bộ Tarot. id giữ nguyên để không mất bùa đã chọn.
  perks: [
    { id: "rollTip", num: "I", name: "Pháp Sư", en: "The Magician", icon: "✨", desc: "Đôi tay khéo léo: mỗi món cuốn thêm 5k tip" },
    { id: "loveFast", num: "III", name: "Hoàng Hậu", en: "The Empress", icon: "🌸", desc: "Dồi dào yêu thương: thanh tim sạc nhanh hơn 30%" },
    { id: "heroPlus", num: "VI", name: "Tình Nhân", en: "The Lovers", icon: "💕", desc: "Có nhau là đủ: anh Hiếu làm giùm mà khách không bớt tip" },
    { id: "shakeFast", num: "VII", name: "Cỗ Xe", en: "The Chariot", icon: "🛵", desc: "Ý chí & tốc độ: lắc bịch, cuốn bánh bớt 2 lần" },
    { id: "comboKeep", num: "VIII", name: "Sức Mạnh", en: "Strength", icon: "💪", desc: "Dịu dàng mà vững: lần sai đầu mỗi ca không mất combo" },
    { id: "rushTip", num: "X", name: "Bánh Xe Số Phận", en: "Wheel of Fortune", icon: "☸️", desc: "Vận may xoay tới: giờ cao điểm tip ×2,5" },
    { id: "softWalk", num: "XII", name: "Người Treo Ngược", en: "The Hanged Man", icon: "🪴", desc: "Buông nhẹ một chút: khách bỏ đi lần đầu mỗi ca không mất tim" },
    { id: "drinkTip", num: "XIV", name: "Tiết Chế", en: "Temperance", icon: "🧋", desc: "Pha trộn hài hoà: mỗi món nước thêm 3k tip" },
    { id: "firstPatience", num: "XVII", name: "Ngôi Sao", en: "The Star", icon: "⭐", desc: "Hy vọng đầu ngày: 2 khách đầu ca kiên nhẫn gấp đôi" },
    { id: "crispyWide", num: "XIX", name: "Mặt Trời", en: "The Sun", icon: "☀️", desc: "Ấm áp rực rỡ: vùng nướng giòn rộng hơn" },
    { id: "sideBonus", num: "XX", name: "Phán Xét", en: "Judgement", icon: "🎉", desc: "Được ghi nhận: thưởng mục tiêu phụ ×2" },
    { id: "tipAll", num: "XXI", name: "Thế Giới", en: "The World", icon: "💫", desc: "Viên mãn: tip của mọi khách +10%" }
  ],
  perkOffer: 3,
  // Lá bài hôm nay: 22 lá Ẩn chính; lá xuôi cho hiệu ứng nhỏ trong ngày (tip / kiên nhẫn / sạc tim), lá ngược chỉ là lời khuyên
  tarot: {
    reversedRate: 0.25,
    cards: [
      { num: "0", name: "Chàng Khờ", en: "The Fool", icon: "🎒", effect: { patience: 1.1 } },
      { num: "I", name: "Pháp Sư", en: "The Magician", icon: "✨", effect: { tip: 1.05 } },
      { num: "II", name: "Nữ Tư Tế", en: "The High Priestess", icon: "🌕", effect: { love: 1.15 } },
      { num: "III", name: "Hoàng Hậu", en: "The Empress", icon: "🌸", effect: { love: 1.15 } },
      { num: "IV", name: "Hoàng Đế", en: "The Emperor", icon: "🏮", effect: { patience: 1.1 } },
      { num: "V", name: "Giáo Hoàng", en: "The Hierophant", icon: "📖", effect: { tip: 1.05 } },
      { num: "VI", name: "Tình Nhân", en: "The Lovers", icon: "💕", effect: { love: 1.15 } },
      { num: "VII", name: "Cỗ Xe", en: "The Chariot", icon: "🛵", effect: { patience: 1.1 } },
      { num: "VIII", name: "Sức Mạnh", en: "Strength", icon: "💪", effect: { patience: 1.1 } },
      { num: "IX", name: "Ẩn Sĩ", en: "The Hermit", icon: "🌑", effect: { love: 1.15 } },
      { num: "X", name: "Bánh Xe Số Phận", en: "Wheel of Fortune", icon: "☸️", effect: { tip: 1.05 } },
      { num: "XI", name: "Công Lý", en: "Justice", icon: "🪙", effect: { tip: 1.05 } },
      { num: "XII", name: "Người Treo Ngược", en: "The Hanged Man", icon: "🪴", effect: { patience: 1.1 } },
      { num: "XIII", name: "Sự Chuyển Hoá", en: "Death", icon: "🌅", effect: { tip: 1.05 } },
      { num: "XIV", name: "Tiết Chế", en: "Temperance", icon: "🧋", effect: { patience: 1.1 } },
      { num: "XV", name: "Ác Quỷ", en: "The Devil", icon: "😈", effect: { tip: 1.05 } },
      { num: "XVI", name: "Toà Tháp", en: "The Tower", icon: "⚡", effect: { love: 1.15 } },
      { num: "XVII", name: "Ngôi Sao", en: "The Star", icon: "⭐", effect: { patience: 1.1 } },
      { num: "XVIII", name: "Mặt Trăng", en: "The Moon", icon: "🌕", effect: { love: 1.15 } },
      { num: "XIX", name: "Mặt Trời", en: "The Sun", icon: "☀️", effect: { tip: 1.05 } },
      { num: "XX", name: "Phán Xét", en: "Judgement", icon: "🎉", effect: { tip: 1.05 } },
      { num: "XXI", name: "Thế Giới", en: "The World", icon: "💫", effect: { tip: 1.05 } }
    ]
  },

  // Mục tiêu phụ mỗi mốc (từ Mốc 2): cố định theo số mốc; đạt lần đầu thưởng sideGoalReward (k)
  sideGoalReward: 20,
  sideGoals: [
    { id: "noWalk", text: "Không để khách nào bỏ đi" },
    { id: "combo5", text: "Đạt combo 5 món liên tiếp" },
    { id: "five5", text: "Nhận 5 đánh giá 5 sao" },
    { id: "noHero", text: "Tự làm đúng hết, không cần anh Hiếu sửa món" },
    { id: "fav3", text: "Bán 3 phần món ruột của tiệm" },
    { id: "req3", text: "Làm đúng 3 yêu cầu riêng của khách", fromLevel: 3 },
    { id: "crispy3", text: "Nướng giòn 3 bánh", fromLevel: 4 }
  ],

  // Chế độ nhanh trong Cài đặt: đặt sẵn trợ giúp + mức sự kiện
  presets: {
    relax: {
      settings: { relaxMode: true, oneTapDeliver: false, oneTapAction: false, tapPour: false, easyGrill: false, slowCustomers: false, fewerRequests: false,
        bookPause: false, moreHearts: false, softFail: false, threeTrays: false, easyHints: false, lateAdd: true, showRecipe: true, realRecipes: false, patienceBoost: 0.5, heroFix: true },
      events: { shiftEvent: 0.5, rush: 0.5, vip: 1, rival: 0, spill: 0, cat: 1, flirt: 1, helperMishap: 0, rent: 0.5, date: 2, takeout: 0.5, bulk: 0.5 }
    },
    normal: {
      settings: { relaxMode: false, oneTapDeliver: false, oneTapAction: false, tapPour: false, easyGrill: false, slowCustomers: false, fewerRequests: false,
        bookPause: false, moreHearts: false, softFail: false, threeTrays: false, easyHints: false, lateAdd: true, showRecipe: true, realRecipes: false, patienceBoost: 0, heroFix: true },
      events: { shiftEvent: 1, rush: 1, vip: 1, rival: 1, spill: 1, cat: 1, flirt: 1, helperMishap: 1, rent: 1, date: 1, takeout: 1, bulk: 1 }
    },
    hard: {
      settings: { relaxMode: false, oneTapDeliver: false, oneTapAction: false, tapPour: false, easyGrill: false, slowCustomers: false, fewerRequests: false,
        bookPause: false, moreHearts: false, softFail: false, threeTrays: false, easyHints: false, lateAdd: false, showRecipe: false, realRecipes: true, patienceBoost: 0, heroFix: false },
      events: { shiftEvent: 2, rush: 2, vip: 2, rival: 2, spill: 2, cat: 1, flirt: 1, helperMishap: 1, rent: 1, date: 1, takeout: 2, bulk: 2 }
    }
  },

  // Chống mất tiến trình
  safety: { snapshots: 3, backupEveryDays: 7, tipSnoozeDays: 7, backupAfterShifts: 3 },

  // Món sáng tạo (Bếp sáng tạo): giá = tổng giá 1 phần nguyên liệu × priceMult + priceAdd
  customDish: {
    max: 3, minIng: 2, maxIng: 5, nameMax: 24, priceMult: 2, priceAdd: 5,
    zones: ["tron", "cuon", "che"],
    finish: { tron: ["tac", "lac"], cuon: ["cuon", "nuoc_cham"], che: ["da"] },
    emoji: { tron: "🥗", cuon: "🌯", che: "🍧" },
    weight: 0.6,          // trọng số khách lạ gọi món sáng tạo
    regularChance: 0.35   // khách quen: xác suất gọi món sáng tạo thay món ruột
  },
  // Hẹn hò sau ca: lật thẻ ghép đôi
  dateGame: { rate: 0.25, seconds: 45, pairs: 6, reward: 30, flipBackMs: 600, icons: ["💝", "🎁", "💐", "🎀", "🎈", "⭐"] },

  // Nhiệm vụ tuần: dùng chung chỉ số với nhiệm vụ ngày, mức cao hơn; xong cả 5 → đồ trang trí độc quyền
  weeklyCount: 5,
  weeklyRewardCoins: 200,   // nhận hết đồ độc quyền rồi thì thưởng tiền
  weeklyQuests: [
    { id: "served", n: 120 }, { id: "days", n: 12 }, { id: "five", n: 40 }, { id: "fav", n: 15 },
    { id: "comboMax", n: 8 }, { id: "crispy", n: 15, fromDay: 4 }, { id: "req", n: 20, fromDay: 3 }, { id: "flirt", n: 8, fromDay: 3 }
  ],

  // Giờ cao điểm: một đợt mỗi ca (khi tiến độ nằm trong window), khách nhanh gấp đôi, tip ×2
  rush: { fromLevel: 4, window: [0.4, 0.6], sec: 20, spawnFactor: 0.5, tipMult: 2 },
  // Khách đặc biệt hiếm (tối đa 1 người mỗi ca). reward: thưởng (k) khi phục vụ xong.
  vipGuests: {
    rate: 0.04, fromLevel: 5,
    list: [
      { id: "critic", name: "Nhà phê bình ẩm thực", avatar: "🧑‍💼", doodle: "office_m", patience: 24, tip: [5, 8], self: "tôi", call: "chủ quán", reward: 50,
        lines: ["Tôi đến chấm điểm tiệm này. Cho tôi món ngon nhất nhé."] },
      { id: "tiktoker", name: "Ngôi sao TikTok", avatar: "🧑", doodle: "friend_b", patience: 28, tip: [6, 10], self: "mình", call: "chị chủ", reward: 40, boostNext: 3,
        lines: ["Hello cả nhà, hôm nay mình review tiệm bánh tráng siêu xinh nè!"] },
      { id: "santa", name: "Ông già Noel", avatar: "🧑", doodle: "chu_tu", patience: 40, tip: [10, 10], self: "ông", call: "cháu", reward: 80, months: [12],
        lines: ["Hô hô hô! Ông ghé tiệm cháu lấy sức đi phát quà nè!"] },
      { id: "couple", name: "Cô dâu chú rể", avatar: "🧑", doodle: "friend_a", patience: 30, tip: [8, 12], self: "tụi mình", call: "chị chủ", reward: 60, twoDish: true,
        lines: ["Tụi mình mới cưới xong, ghé tiệm ăn mừng nè!"] }
    ]
  },
  // Thú cưng có việc làm (mỗi con một lần mỗi ca)
  petJobs: { miuAt: 0.2, miuRefill: 0.3, cunEmptySec: 6, hamsterRate: 0.3, hamsterCoins: [10, 30] },

  // Chế độ thư giãn: một công tắc bật các trợ giúp này (+ kiên nhẫn +50%)
  relaxMode: ["oneTapDeliver", "oneTapAction", "tapPour", "easyGrill", "slowCustomers", "moreHearts", "easyHints"],
  // Số liệu các trợ giúp
  assist: { slowFactor: 1.4, requestFactor: 0.3, hearts: 5, softFailMin: 0.5, trays: 3 },

  // Anh Hiếu phụ tiệm (Mùa 2). levelAt = số ca làm chung để lên cấp 1/2/3; *Sec = thời gian theo cấp.
  helper: {
    fromSeason: 1, fromMilestone: 1, levelAt: [0, 8, 20],
    waiterSec: [1.5, 1.1, 0.8], drinkSec: [6, 5, 4], cheSec: [1.2, 0.9, 0.6], patienceSlow: 0.1,
    drinks: ["tra_da", "tra_tac", "nuoc_mia_ly"], eventRate: 0.1, lateShare: 0.2, lateEndlessServed: 5, bubbleEverySec: [14, 22]
  },

  // Bác Sáu chủ nhà (Mùa 2): ghé thu tiền mặt bằng ở ca đầu các mốc lớn chẵn từ ngày fromDay.
  landlord: { fromDay: 18, rent: { 18: 50, 22: 80, 26: 100, 30: 120 } },
  // Xe chè đối thủ (Mùa 2): xuất hiện giữa ca (window = khoảng tiến độ ca), khách mất kiên nhẫn nhanh hơn.
  rival: { fromDay: 22, rate: 0.25, window: [0.35, 0.65], patienceFaster: 0.15, beatStreak: 5, beatReward: 30 },

  // Ca vô tận: khách đến mãi, nhanh dần; 3 tim. rewards: số khách → thưởng một lần (k).
  endless: {
    fromMilestone: 7,
    minSpawn: [1.8, 2.6],       // khoảng cách khách đến nhanh nhất (giây)
    rampEvery: 5,               // cứ chừng này khách thì nhanh thêm một nấc
    rampFactor: 0.92,
    eventEvery: 15,             // đổi biến cố sau chừng này khách
    unitsPer: 12,               // chừng này khách = 1 ca chuẩn tiến độ mốc
    unitsMax: 2,
    flirtEvery: 12,             // anh Hiếu ghé thả thính sau mỗi chừng này khách
    tomoEvery: 20,              // anh Hiếu ghé mua sau mỗi chừng này khách
    rewards: { 50: 100, 100: 200, 200: 400 }
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
    // Mùa 2 · Quầy chè (mốc lớn 16–30). unlock điền ở bước quầy chè.
    { day: 16, customers: 18, target: 760, spawn: [3.0, 4.0], patienceMult: 1.0, unlock: ["che_dau_xanh", "sua_chua_da"], weather: "sunny", tipMult: 1, cheWeight: 0.5, hints: true },
    { day: 17, customers: 18, target: 810, spawn: [2.97, 3.96], patienceMult: 1.0, unlock: ["che_dau_do"], weather: "windy", tipMult: 1, cheWeight: 0.5 },
    { day: 18, customers: 19, target: 860, spawn: [2.94, 3.91], patienceMult: 0.99, unlock: ["che_suong_sao"], weather: "payday", tipMult: 2, cheWeight: 0.5 },
    { day: 19, customers: 19, target: 910, spawn: [2.91, 3.87], patienceMult: 0.99, unlock: ["sua_chua_mit"], weather: "hot", tipMult: 1, drinkWeight: 2 },
    { day: 20, customers: 20, target: 960, spawn: [2.88, 3.82], patienceMult: 0.99, unlock: ["che_thap_cam"], weather: "sunny", tipMult: 1 },
    { day: 21, customers: 20, target: 1010, spawn: [2.85, 3.77], patienceMult: 0.98, unlock: ["sua_chua_nep_cam"], weather: "reviewer", tipMult: 1, ratingWeight: 3 },
    { day: 22, customers: 21, target: 1060, spawn: [2.82, 3.73], patienceMult: 0.98, unlock: ["che_thai"], weather: "rain", tipMult: 1, grillWeight: 2 },
    { day: 23, customers: 21, target: 1110, spawn: [2.79, 3.69], patienceMult: 0.97, unlock: ["sua_chua_tran_chau"], weather: "windy", tipMult: 1 },
    { day: 24, customers: 22, target: 1170, spawn: [2.76, 3.64], patienceMult: 0.97, unlock: ["che_dua_non"], weather: "school", tipMult: 1, groupOf: 3 },
    { day: 25, customers: 22, target: 1230, spawn: [2.73, 3.6], patienceMult: 0.97, unlock: ["che_ba_mau"], weather: "payday", tipMult: 2 },
    { day: 26, customers: 23, target: 1290, spawn: [2.7, 3.55], patienceMult: 0.96, unlock: ["sua_chua_dua"], weather: "hot", tipMult: 1, drinkWeight: 2 },
    { day: 27, customers: 23, target: 1350, spawn: [2.67, 3.5], patienceMult: 0.96, unlock: ["combo_mua_he"], weather: "sunny", tipMult: 1 },
    { day: 28, customers: 24, target: 1410, spawn: [2.64, 3.46], patienceMult: 0.96, unlock: ["che_dac_biet"], weather: "rain", tipMult: 1, grillWeight: 2 },
    { day: 29, customers: 24, target: 1460, spawn: [2.61, 3.42], patienceMult: 0.95, unlock: [], weather: "festival", tipMult: 1.5 },
    { day: 30, customers: 24, target: 1500, spawn: [2.6, 3.4], patienceMult: 0.95, unlock: ["ly_che_hen_ho"], weather: "sunset", tipMult: 1 },
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
    { id: "rem_hong", name: "Rèm hồng pastel", emoji: "🎀", price: 120 },
    // Đồ trang trí độc quyền: chỉ nhận từ nhiệm vụ tuần (không bán trong cửa hàng)
    { id: "chuong_gio", name: "Chuông gió", emoji: "🎐", price: 0, weekly: true },
    { id: "den_day", name: "Dây đèn lấp lánh", emoji: "✨", price: 0, weekly: true },
    { id: "bang_chalk", name: "Bảng phấn thực đơn", emoji: "📝", price: 0, weekly: true },
    { id: "gau_bong", name: "Gấu bông ngồi quầy", emoji: "🧸", price: 0, weekly: true }
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
    btnRetry: "Làm lại ca",
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
    dayN: "Mốc {n}",
    secretDay: "Ca bí mật",
    back: "Quay lại",
    comingSoon: "Góc này {nick} đang xây, bản cập nhật tới sẽ mở cho {her} nha 💕",
    comingSoonShort: "Sắp có rồi nha 💕",
    privateMode: "Chế độ ẩn danh: tiến trình sẽ không được lưu",
    rotate: "Xoay dọc điện thoại để chơi nhé 📱",

    // Bản đồ & Chuẩn bị
    mapTitle: "Đường mốc",
    dayLockedPrev: "Qua Ngày {p} để mở nha",
    dayLockedBuild: "Ngày {n} sẽ mở ở bản cập nhật tới 💕",
    secretLocked: "Đi hết Mùa 1 để mở Ca bí mật ★",
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
    zoneLocked: "Khu {zone} mở ở Mốc {n}",
    zoneLaterBuild: "Khu {zone} sẽ có ở bản cập nhật tới 💕",
    pickTrayFirst: "Chọn một bịch đã làm rồi chạm khách để giao nha",
    trayIsEmpty: "Bịch này còn trống mà",
    notArrived: "Đợi khách tới quầy đã nha",
    trashed: "Đã bỏ vào thùng rác",
    trashNothing: "Chọn bịch muốn bỏ trước nha",
    pauseTitle: "Tạm dừng",
    leaveConfirm: "Rời tiệm giữa ca thì ca này sẽ tính lại từ đầu nha.",
    bookTitle: "Sổ công thức 📖",
    bookBase: "Đế",
    bookLayers: "Lớp (dưới → trên)",
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
    wrongOrder: "Sai thứ tự lớp rồi {call}, {ing} chưa đúng chỗ!",
    badOrder: "Sai thứ tự lớp: {ing}",
    needLayer: "Xếp ít nhất một lớp trước rồi mới thêm {ing} nha",
    layerAfterTop: "Đã thêm lớp phủ rồi, không xếp lớp nữa nha",
    wrongExtra: "Ủa, {self} không gọi {ing} mà {call}!",
    wrongNotMixed: "Chưa trộn đều nè!",
    praise: ["Ngon quá!", "Tuyệt cú mèo!", "Bà chủ {her} giỏi ghê!", "Mai ghé nữa nha!", "Đúng vị luôn!", "10 điểm!", "Nhớ ý ghê!"],
    fast: ["Nhanh quá! ⚡", "Siêu tốc!", "Chớp nhoáng!"],
    angry: ["Lâu quá à...", "Thôi đi chỗ khác!", "Đói xỉu rồi 😩"],
    loseLines: ["Không sao, mình làm lại nha {her}! 💪", "Em làm tốt lắm rồi, thử ca nữa nào!", "Anh {me} tin bà chủ làm được mà ❤️"],
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
    statRating: "Điểm đánh giá trung bình ca",
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
    runMsSeason: "Mùa {s} · Mốc {n}",
    helperPick: "Hôm nay anh Hiếu phụ…",
    setAssistTitle: "Trợ giúp",
    setEasyHints: "Gợi ý nguyên liệu (chế độ dễ)",
    setLateAdd: "Thêm nguyên liệu sau khi làm xong",
    setShowRecipe: "Hiện công thức trên order",
    setEventsTitle: "Sự kiện",
    presetTitle: "Chế độ nhanh",
    preset_relax: "Thư giãn",
    preset_normal: "Bình thường",
    preset_hard: "Thử thách",
    presetHint_relax: "Bật hết trợ giúp, khách kiên nhẫn hơn, ít sự cố, hay được hẹn hò.",
    presetHint_normal: "Như mặc định của game.",
    presetHint_hard: "Ẩn công thức, công thức chuẩn ngoài đời, nhiều giờ cao điểm & sự kiện.",
    presetCustom: "Đang tuỳ chỉnh riêng. Chọn một chế độ để đặt lại.",
    setTab_general: "Chung",
    setTab_assist: "Trợ giúp",
    setTab_events: "Sự kiện",
    setTextScale: "Cỡ chữ",
    textScales: ["Vừa", "Lớn", "Rất lớn"],
    setEventsNote: "Chạm để đổi mức: Vừa (như mặc định) → Nhiều → Tắt → Ít",
    evLevels: { "0": "Tắt", "0.5": "Ít", "1": "Vừa", "2": "Nhiều" },
    ev_shiftEvent: "Sự kiện đầu ca (gió, mưa, lễ hội…)",
    ev_rush: "Giờ cao điểm",
    ev_vip: "Khách đặc biệt",
    ev_rival: "Quán đối thủ",
    ev_spill: "Vũng nước đổ",
    ev_cat: "Mèo hoang",
    ev_flirt: "Anh Hiếu ghé thả thính",
    ev_helperMishap: "Anh Hiếu đến trễ, làm đổ",
    ev_rent: "Tiền thuê nhà",
    ev_date: "Hẹn hò sau ca",
    ev_takeout: "Đơn mang về (từ cấp 8)",
    ev_bulk: "Đơn sỉ (từ cấp 10)",
    takeoutTitle: "Đơn mang về",
    takeoutNew: "Có đơn mang về! Tài xế tới trong {n} giây",
    takeoutHow: "Chọn món đã làm xong rồi chạm vào đơn mang về",
    takeoutNotIn: "Đơn này không có món đó",
    takeoutDone: "Giao đơn mang về: +{x}",
    takeoutLate: "Tài xế chờ lâu quá nên đi mất rồi",
    bulkTag: "Đơn sỉ ×{n}",
    bulkLine: "Cho chị {n} phần {dish} nha, lớp chị đông lắm!",
    bulkLacking: "Thiếu nguyên liệu cho {n} phần (còn thiếu {ing})",
    bulkDone: "Đơn sỉ {n} phần xong!",
    perkTitle: "Rút một lá bài cho tiệm",
    perkIntro: "Qua mốc lớn rồi! Lật 3 lá úp, chọn một lá làm bùa hộ mệnh cho tiệm (giữ mãi).",
    perkBtn: "Rút lá bài mới ✨",
    perkGot: "Tiệm có thêm lá {name}",
    perkTake: "Chọn lá này",
    perkFlipHint: "Chạm vào lá bài để lật",
    perksTitle: "Bộ bài của tiệm",
    perksCount: "Bộ bài · {a}/{b}",
    perkNone: "Qua mốc lớn để rút lá bài đầu tiên",
    tarotTile: "Lá bài hôm nay 🔮",
    tarotTitle: "Lá bài hôm nay",
    tarotIntro: "Hít một hơi, nghĩ về ca bán hôm nay, rồi chọn một lá.",
    tarotUp: "Xuôi",
    tarotRev: "Ngược",
    tarotEff_tip: "Hôm nay: tip +{p}%",
    tarotEff_patience: "Hôm nay: khách kiên nhẫn +{p}%",
    tarotEff_love: "Hôm nay: thanh tim sạc nhanh +{p}%",
    tarotRevNote: "Lá ngược: không có hiệu ứng, chỉ là một lời nhắc nhỏ.",
    tarotChip: "Lá hôm nay: {name}{rev}",
    tarotChipNone: "Chưa rút lá bài hôm nay (Sổ tay)",
    setHoldCabinet: "Tủ giữ món (làm sẵn trước, từ cấp 6)",
    setRhythm: "Nhịp lắc / cuốn (trúng nhịp được Ngon tuyệt!)",
    holdTitle: "Tủ",
    holdHow: "Chọn bịch/ly đã làm xong rồi chạm ô tủ để cất",
    holdNoGrill: "Bánh nướng ăn nóng mới ngon, không cất tủ được",
    holdStored: "Đã cất vào tủ",
    holdStale: "nguội",
    perfectShake: "Ngon tuyệt!",
    setHeroFix: "Anh Hiếu giúp làm món (sửa món sai, cứu khách sắp đi, nút Nhờ anh)",
    heroBtn: "Nhờ anh Hiếu",
    ingRemoved: "Đã bỏ {ing} ra",
    tip_hero: "Nút có hình anh Hiếu: bấm rồi chạm vào một khách, anh sẽ làm món cho khách đó. Lỡ giao sai hay khách sắp bỏ đi, anh cũng tự nhảy vào giúp.",
    tip_hold: "Tủ giữ món: chọn bịch/ly đã làm xong rồi chạm ô Tủ để cất. Khách gọi đúng món thì chạm ô tủ rồi chạm khách. Để lâu quá 40 giây món sẽ nguội.",
    tip_takeout: "Đơn mang về! Làm đủ các món trên điện thoại, chọn từng món rồi chạm vào đơn trước khi tài xế đi.",
    tip_bulk: "Đơn sỉ: khách gọi nhiều phần cùng một món. Làm một khay là đủ, game tự trừ nguyên liệu cho các phần còn lại.",
    tip_rhythm: "Mẹo: lắc đúng lúc vòng hồng khép lại để được Ngon tuyệt!",
    tip_retap: "Lỡ chạm nhầm? Chạm lại nguyên liệu vừa thêm để bỏ nó ra.",
    heroPickHint: "Chạm vào khách cần anh Hiếu làm giùm",
    heroPickNo: "Khách này không cần làm giúp",
    heroWait: "Đợi anh Hiếu xíu",
    heroNoStock: "Anh Hiếu: hết {ing} rồi, anh chịu!",
    heroQueue: "còn {n} món đang chờ anh",
    heroFixLeft: "còn {n} lần",
    sideGoalTitle: "Mục tiêu phụ",
    sideGoalDone: "Mục tiêu phụ: {text} ✓",
    sideGoalFirst: " (+{x})",
    sideGoalFail: "Mục tiêu phụ chưa đạt: {text}",
    practiceBtn: "Bếp tập",
    practiceTitle: "Bếp tập: chọn món để tập",
    practiceIntro: "Không có khách thật, không tính giờ, không tốn tiền hay nguyên liệu. Tập thoải mái nha!",
    practiceOkTitle: "Chuẩn rồi!",
    practiceOk: "Làm đúng {dish} rồi. Tập món khác không?",
    practiceAgain: "Tập món khác",
    practiceSame: "Làm lại món này",
    practiceChange: "Đổi món",
    practiceExit: "Thoát",
    practiceBar: "Bếp tập · {dish}",
    setRealRecipes: "Công thức chuẩn ngoài đời (thêm hành phi, sa tế, muối tôm…)",
    setPatience: "Kiên nhẫn của khách",
    setRelax: "Chế độ thư giãn (bật hết trợ giúp)",
    setAutoSeasonSkin: "Tự trang trí tiệm theo mùa",
    rushStart: "GIỜ CAO ĐIỂM! Khách ùa vào, tip gấp đôi 🔥",
    badgesTitle: "Huy hiệu",
    badgesCount: "Huy hiệu · {a}/{b}",
    badgeGet: "Huy hiệu mới: {name} (+{x})",
    weekBtn: "Tuần này",
    notebookBtn: "Sổ tay 📋",
    notebookTitle: "Sổ tay",
    kitchenBtn: "Bếp sáng tạo",
    kitchenTitle: "Bếp sáng tạo",
    kitchenIntro: "Tự nghĩ món của tiệm mình (tối đa {n} món). Khách sẽ thỉnh thoảng gọi, khách quen thích gọi hơn.",
    kitchenNew: "Tạo món mới",
    kitchenFull: "Đủ món rồi, xoá bớt để tạo mới",
    kitchenDelete: "Xoá",
    kitchenSave: "Lưu món",
    kitchenNamePh: "Tên món (vd: Trộn của Bống)",
    kitchenHint: "Chọn {a}–{b} nguyên liệu",
    kitchenHintChe: "Chọn {a}–{b} lớp, chạm theo thứ tự từ đáy lên",
    kitchenMade: "Đã thêm {name} vào thực đơn!",
    kitchenErr_full: "Bếp đầy rồi, xoá bớt một món nha",
    kitchenErr_zone: "Quầy này chưa mở",
    kitchenErr_name: "Đặt tên món đã nha (tối đa {n} ký tự)",
    kitchenErr_count: "Chọn từ {a} đến {b} nguyên liệu",
    kitchenErr_ing: "Có nguyên liệu không hợp quầy này",
    dateBtn: "Hẹn hò sau ca 💕",
    dateTitle: "Hẹn hò sau ca",
    dateTimer: "Lật thẻ tìm cặp · còn {n} giây",
    dateWinTitle: "Hẹn hò thành công 💕",
    dateLoseTitle: "Hụt mất rồi",
    dateLose: "Không sao, mai mình hẹn tiếp.",
    dateReward: "Anh Hiếu bao chầu này: +{x}",
    dateAllNotes: "Sổ hẹn hò đã đầy, nhưng buổi hẹn vẫn vui như lần đầu.",
    dateBookTitle: "Sổ hẹn hò",
    dateBookCount: "Sổ hẹn hò · {a}/{b}",
    dateNoteN: "Buổi hẹn {n}",
    dateLocked: "Thắng một buổi hẹn sau ca để mở",
    weekTitle: "Nhiệm vụ tuần",
    weekReward: "Xong cả 5 nhiệm vụ: nhận {name}",
    weekRewardCoins: "Xong cả 5 nhiệm vụ: nhận {x}",
    weekClaim: "Nhận quà tuần",
    weekClaimed: "Đã nhận quà tuần này, tuần sau có nhiệm vụ mới nha",
    weekGot: "Nhận được {name}!",
    rushBanner: "GIỜ CAO ĐIỂM 🔥 {s}s",
    rushEnd: "Hết giờ cao điểm, thở phào!",
    vipServed: "{name} hài lòng! +{x}",
    vipBoost: "{name} đăng clip, ca sau đông khách hơn!",
    petMiu: "{pet} dụi chân khách, khách vui vẻ chờ thêm 🐱",
    petCun: "Cún Bông chạy ra cửa vẫy đuôi kéo khách vào!",
    petCoins: "Hạt Dẻ nhặt được {x} rơi dưới quầy!",
    hudRecord: "★ {x}",
    recordBroken: "Phá kỷ lục! ★",
    newRecord: "Kỷ lục mới! ★",
    monthiversaryTitle: "Kỷ niệm tháng 💕",
    specialGiftBtn: "Nhận quà của anh 🎁",
    specialGift: "Quà của anh: +{x}",
    mailBtn: "Thư 💌",
    mailTitle: "Hộp thư của anh",
    mailWeek: "Tuần {n}",
    mailNext: "Tuần sau có thư mới nha",
    seasonCompliments: ["Tiệm trang trí xinh quá bà chủ ơi!", "Trang trí đẹp vậy, chụp hình sống ảo được luôn!", "Vô tiệm là thấy không khí lễ liền!"],
    setOneTapDeliver: "Giao một chạm (chạm khay là giao)",
    setOneTapAction: "Lắc, cuốn một chạm",
    setTapPour: "Rót một chạm (không cần giữ)",
    setEasyGrill: "Bếp nướng hiền (vùng xanh rộng, không cháy)",
    setSlowCustomers: "Khách đến thưa hơn",
    setFewerRequests: "Ít yêu cầu riêng & đơn 2 món",
    setBookPause: "Tạm dừng khi xem sổ công thức",
    setMoreHearts: "5 tim thay vì 3",
    setSoftFail: "Thua vẫn cộng nửa ca tiến độ",
    setThreeTrays: "Có sẵn 3 khay",
    setRelaxNote: "Đang bật trong Chế độ thư giãn",
    patienceLevels: ["Bình thường", "+25%", "+50%"],
    hintHold: "Giữ ô {name} để rót",
    landlordTitle: "Bác Sáu chủ nhà ghé",
    landlordAmount: "Tiền mặt bằng: {x}",
    landlordOwed: "(gồm {x} còn nợ)",
    landlordPay: "Gửi bác {x}",
    landlordDefer: "Khất bác tuần sau",
    landlordAuto: "Ví chưa đủ tiền nhà, bác Sáu cho khất tới lần sau nè",
    landlordAutoPaid: "Gửi bác được {x}, còn nợ {y}",
    rivalArrive: "Xe chè đối thủ đậu bên kia đường! Phục vụ liền {n} khách để giữ khách nha",
    rivalWin: "Xe chè đối thủ chịu thua, dọn đi rồi! +{x}",
    rivalBanner: "Xe chè đối thủ · còn {n} khách nữa",
    helperRole_waiter: "Chạy bàn",
    helperRole_drinks: "Pha nước",
    helperRole_che: "Phụ chè",
    helperRole_off: "Anh nghỉ",
    helperBusyNote: "Hôm nay anh Hiếu bận, không phụ được",
    helperNoStock: "Anh Hiếu: hết nguyên liệu pha nước rồi em ơi",
    helperTitle: "Anh phụ tiệm",
    helperLevel: "Ăn ý cấp {n} · {s} ca làm chung",
    helperChapterTitle: "Sau giờ đóng cửa · Chương {n}",
    helperLocked: "Chương này mở khi hai người ăn ý hơn",
    goldHearts2: "Mùa 2 · 💛 {a}/{b}",
    bonusCard2: "Lời nhắn bí mật Mùa 2",
    bonusLocked2: "Đạt 3 sao ở cả 15 mốc lớn Mùa 2 để mở",
    card2Get: "Thẻ công thức mới!",
    memory2Get: "Có kỷ niệm mới, chạm để mở 💌",
    seasonCardTitle: "Mùa 2 mở rồi! 🍧",
    seasonCardSub: "Quầy chè & sữa chua đang chờ bà chủ",
    seasonModalTitle: "Thư của anh",
    btnStartSeason: "Mở Mùa 2",
    season3Soon: "Mùa 3 đang được chuẩn bị 💕",
    seasonTab: "Mùa {s}",
    seasonDoneCard: "Mùa {s} · đã đi hết 🎉",
    cards2Title: "Sổ công thức Mùa 2",
    cards2Count: "Sổ công thức Mùa 2 · {a}/{b}",
    cards2Locked: "Qua mốc lớn để mở",
    memories2Title: "Kỷ niệm Mùa 2",
    runSecret: "Ca bí mật",
    runDaily: "Thử thách",
    runEndless: "Ca vô tận",
    msGain: "+{u} ca",
    msProgress: "{a} / {b} ca",
    msCleared: "Qua {t}! 🎉",
    msMinorCoins: "Thưởng qua mốc: +{x}",
    msTaleTitle: "Chuyện vặt",
    talesBookTitle: "Chuyện vặt của khách",
    talesBookCount: "Chuyện vặt · {a} chuyện",
    talesBookEmpty: "Qua mốc nhỏ để nghe khách kể chuyện nha",
    endlessBtn: "Ca vô tận",
    endlessBest: "Kỷ lục: {n} khách",
    hudEndless: "Khách: {d}",
    endlessEvent: "Đổi không khí: {icon} {label}",
    endlessOver: "Hết tim rồi, nghỉ tay thôi!",
    endlessStop: "Chốt ca! Nghỉ tay thôi!",
    btnEndShift: "Chốt ca",
    dailyReread: "đọc lại",
    endlessResult: "Phục vụ {n} khách!",
    endlessNewBest: "Kỷ lục mới! 🎉",
    endlessReward: "Thưởng mốc {m} khách: +{x}",
    btnPlayAgain: "Chơi lại",
    btnToMenu: "Về tiệm",
    dailyBtn: "Thử thách hôm nay",
    dailyLocked: "Mở ở Mốc {n}",
    dailyTitle: "Thử thách hôm nay",
    dailyEvent: "Biến cố: {icon} {label}",
    dailyFocus: "Món chủ đạo: {dish}",
    dailyRule: "Luật vui: {rule}",
    dailyStreak: "🔥 Chuỗi {n} ngày",
    dailyNoStreak: "Chơi hôm nay để bắt đầu chuỗi 🔥",
    dailyPlay: "Chơi",
    dailyReplay: "Chơi lại (chỉ tính kỷ lục)",
    dailyTiers: ["Hạng đồng ★", "Hạng bạc ★★", "Hạng vàng ★★★"],
    dailyCoins: "+{x} vào ví",
    dailyNoteTitle: "Lời nhắn hôm nay 💌",
    dailyAgain: "Hôm nay nhận quà rồi, ca này chỉ tính kỷ lục nha",
    dailyBest: "Kỷ lục hôm nay: {x}",
    calWeek: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
    calMonth: "Tháng {m}/{y}",
    notesBookTitle: "Sổ lời nhắn",
    notesBookCount: "Sổ lời nhắn · {a} câu",
    notesBookEmpty: "Chơi Thử thách hôm nay để mở lời nhắn đầu tiên nha",
    msMajorLabel: "Mốc lớn · cấp {k}",
    msMinorLabel: "Mốc nhỏ · cấp {k}",
    msCustomers: "Khoảng {c} khách",
    msLocked: "Đi tới Mốc {n} để mở nha",
    msSeasonDone: "Đã đi hết mùa 🎉",
    btnOpenShift: "Mở ca bán",
    btnReplay: "Chơi lại",
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
    memoryLocked: "Qua mốc lớn thứ {n} để mở",
    albumTitle: "Kỷ niệm 💌",
    albumCount: "Đã mở {a}/{b} thẻ",
    goldHearts: "💛 {a}/{b}",
    bonusTitle: "Lời nhắn bí mật 💛",
    bonusCard: "💛 Lời nhắn bí mật",
    bonusLocked: "Đạt 3 sao ở cả 15 mốc lớn để mở lời nhắn bí mật",
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
    reviewDay: "Mốc {n}",
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
    backupFile: "Lưu ra file",
    wnTitle: "Có gì mới",
    wnNext: "Tiếp",
    wnPrev: "Trước",
    wnGo: "Thử ngay",
    wnDone: "Xong",
    setWhatsNew: "Có gì mới",
    backupOpen: "Mở file sao lưu",
    backupFileHint: "Lưu file vào Tệp hoặc iCloud Drive để đổi máy hay lỡ mất dữ liệu vẫn lấy lại được.",
    backupFileSaved: "Đã lưu file sao lưu",
    backupFileMaybe: "Chưa mở được bảng Chia sẻ. Nếu không thấy file, dùng Sao chép mã sao lưu bên dưới nha.",
    backupRecovered: "Dữ liệu lưu bị lỗi, game đã lấy lại bản dự phòng gần nhất",
    tipInstall: "Thêm game vào màn hình chính để không mất tiến trình",
    tipInstallBtn: "Cách làm",
    tipBackup: "Đã lâu chưa lưu tiến trình ra file",
    tipBackupBtn: "Lưu ngay",
    installTitle: "Thêm vào màn hình chính",
    installApple: "1. Mở game bằng Safari.\n2. Chạm nút Chia sẻ (ô vuông có mũi tên lên).\n3. Chọn Thêm vào MH chính, rồi Thêm.\n\nTừ giờ mở game bằng biểu tượng mới trên màn hình chính. Safari có thể tự xoá dữ liệu của trang web không mở trong khoảng 7 ngày, còn game đã thêm vào màn hình chính thì an toàn hơn.",
    installOther: "1. Chạm nút ⋮ (menu) của trình duyệt.\n2. Chọn Cài đặt ứng dụng hoặc Thêm vào màn hình chính.\n\nTừ giờ mở game bằng biểu tượng mới trên màn hình chính để dữ liệu được giữ an toàn hơn.",
    installOk: "Đã hiểu",
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
      { icon: "❤️", title: "Tim, combo & chiêu đặc biệt", text: "Khách bỏ đi mất 1 tim, hết 3 tim là thua ca. Giao đúng liên tiếp được combo. Từ Mốc 11, chạm 💖 để khách đứng yên 8 giây. Dòng chữ cam là yêu cầu riêng, làm đúng được thêm tip." },
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
      tabChe: "Khách gọi chè nè! Chạm tab 🍧 Chè để sang Quầy chè",
      layer: "Lớp {n}: chạm {name}. Chè phải xếp đúng thứ tự từ dưới lên nha!",
      cheTop: "Xong các lớp rồi, thêm {name} lên trên",
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
