// personal.js — CHỈ SỬA FILE NÀY ĐỂ CÁ NHÂN HOÁ
// ------------------------------------------------------------------
// Cách sửa: mở file này bằng Notepad (Windows) hoặc TextEdit (Mac),
// chỉ sửa chữ nằm GIỮA hai dấu ngoặc kép "..." rồi lưu lại.
// Đừng xoá dấu phẩy , ở cuối dòng và dấu ngoặc { } [ ].
// ------------------------------------------------------------------
window.PERSONAL = {
  herName: "Bống",
  herNicknames: ["Bống", "Ba", "Ba dưa", "Sarose", "Molly", "Sa"],
  myName: "Hiếu",
  myNickname: "Tomortle",
  shopName: "Bống tráng",
  anniversary: "2026-01-11",
  favoriteDish: "bt_tron_kho_bo", // Bánh tráng trộn khô bò (giá x2, viền hồng lấp lánh)
  petName: "Miu", // MẶC ĐỊNH: Miu (tên chú mèo cam trước quầy)

  welcomeMessage: "Chào mừng Sarose của Tomortle đến với Bống tráng! Hôm nay tụi mình cùng mở tiệm nhé 💕",
  finalMessage: "Cảm ơn em vì đã luôn ở bên anh. Dù ngoài đời hay trong game, chỉ cần bé thích, anh sẽ luôn ở đây chiều em. Yêu em lắm! ❤️",
  bonusMessage: "Bà chủ đỉnh quá, đạt 3 sao hết tất cả các ngày luôn! Chụp màn hình này gửi anh để đổi một chầu bánh tráng ngoài đời thật + 1 điều ước bất kỳ từ anh nhé 💛✨",

  // 15 kỷ niệm & phiếu hẹn tương lai, mỗi ngày qua lần đầu mở 1 thẻ
  memories: [
    {
      title: "Ngày đầu tiên trò chuyện",
      date: "2026-01-01", // MẶC ĐỊNH: 2026-01-01
      photo: "assets/memories/01.jpg",
      text: "Tin nhắn đầu tiên mở ra câu chuyện của Tomortle và Sarose — từ những cuộc trò chuyện nhỏ xíu mà thương nhau lúc nào không hay."
    },
    {
      title: "Chính thức thành một đôi",
      date: "2026-01-11",
      photo: "assets/memories/02.jpg",
      text: "Ngày 11/01/2026 — ngày Bống gật đầu đồng ý, chính thức mở ra hành trình yêu thương của tụi mình."
    },
    {
      title: "Bộ sưu tập biệt danh",
      date: "2026-01-20", // MẶC ĐỊNH: 2026-01-20
      photo: "assets/memories/03.jpg",
      text: "Từ Bống, Ba, Ba dưa đến Sarose, Molly, Sa — tên nào của bé gọi lên anh cũng thấy đáng yêu hết."
    },
    {
      title: "Những đêm thức khuya tâm sự",
      date: "2026-02-14", // MẶC ĐỊNH: 2026-02-14
      photo: "assets/memories/04.jpg",
      text: "Valentine đầu tiên tuy chưa ở cạnh nhau ngoài đời, nhưng chỉ cần nghe giọng em là bao nhiêu mệt mỏi đều tan biến."
    },
    {
      title: "Kỷ niệm 100 ngày bên nhau",
      date: "2026-04-21",
      photo: "assets/memories/05.jpg",
      text: "100 ngày yêu thương — từng ngày trôi qua anh lại càng mong sớm đến lúc được gặp bé ngoài đời thật."
    },
    {
      title: "Những trận game cùng nhau",
      date: "2026-05-15", // MẶC ĐỊNH: 2026-05-15
      photo: "assets/memories/06.jpg",
      text: "Cùng nhau chơi game, cùng cười nghiêng ngả qua màn hình — ở đâu có em ở đó đều vui."
    },
    {
      title: "Kỷ niệm 200 ngày bên nhau",
      date: "2026-07-30",
      photo: "assets/memories/07.jpg",
      text: "200 ngày đồng hành cùng nhau, cảm ơn Ba dưa vì đã luôn kiên nhẫn, dịu dàng và ở bên anh."
    },
    {
      title: "Chuyện của tiệm \"Bống tráng\"",
      date: "2026-09-10", // MẶC ĐỊNH: 2026-09-10
      photo: "assets/memories/08.jpg",
      text: "Vì biết bé mê bánh tráng nên Tomortle mở hẳn một tiệm bánh tráng riêng dành tặng bà chủ Bống."
    },
    {
      title: "Kỷ niệm 300 ngày bên nhau",
      date: "2026-11-07",
      photo: "assets/memories/09.jpg",
      text: "Hơn 300 ngày yêu nhau — tình cảm dành cho Sarose chỉ có tăng lên chứ không bao giờ giảm."
    },
    {
      title: "Tấm vé hẹn hò #1: Lần đầu gặp mặt",
      date: "Sắp tới",
      photo: "assets/memories/10.jpg",
      text: "Phiếu hẹn ngày đầu tiên anh được đứng trước mặt Bống ngoài đời thật, nhìn thấy em cười không còn qua màn hình nữa."
    },
    {
      title: "Tấm vé hẹn hò #2: Cái ôm đầu tiên",
      date: "Sắp tới",
      photo: "assets/memories/11.jpg",
      text: "Một cái ôm thật chặt để bù lại cho tất cả những ngày tháng tụi mình chỉ gặp nhau qua tin nhắn và cuộc gọi."
    },
    {
      title: "Tấm vé hẹn hò #3: Chầu bánh tráng ngoài đời",
      date: "Sắp tới",
      photo: "assets/memories/12.jpg",
      text: "Dẫn bà chủ đi ăn sập quán bánh tráng ngon nhất — ngoài đời bé chỉ việc ngồi ăn thôi, mọi thứ để anh lo!"
    },
    {
      title: "Tấm vé hẹn hò #4: Buổi đi chơi đầu tiên",
      date: "Sắp tới",
      photo: "assets/memories/13.jpg",
      text: "Cùng nhau dạo phố, ăn vặt và chụp thật nhiều tấm hình chung để lấp đầy cuốn album này."
    },
    {
      title: "Tấm vé hẹn hò #5: Xem phim & nắm tay",
      date: "Sắp tới",
      photo: "assets/memories/14.jpg",
      text: "Một buổi tối bình yên đúng nghĩa chỉ có hai đứa, nắm tay nhau và kể cho nhau nghe đủ thứ chuyện trên đời."
    },
    {
      title: "Lời hứa của Tomortle",
      date: "Mãi về sau",
      photo: "assets/memories/15.jpg",
      text: "Dù hôm nay mới là tiệm bánh tráng trong game, ngày tụi mình gặp nhau ngoài đời nhất định sẽ sớm tới. Yêu Bống! ❤️"
    }
  ],

  // 7 người bạn chung ghé tiệm ủng hộ (ĐÃ ĐỔI: tối đa 6 tên -> 7 tên theo danh sách người dùng cung cấp)
  friends: ["Kiều", "Mai", "Thảo", "Huân", "Như", "Quyên", "Băng"],

  // Mẫu gọi món đặc trưng của khách "Hiếu / Tomortle"
  anhOrderTemplate: "Bé ơi cho anh một xuất {dish} với {drink} đi, ăn xong mình lnlk😈😈😈",

  // Câu thoại ngẫu nhiên của khách "Hiếu / Tomortle" khi ghé tiệm và nhận món
  anhLines: [
    "Bé ơi cho anh một xuất {dish} với {drink} đi, ăn xong mình lnlk😈😈😈",
    "Tomortle đói bụng rồi, bà chủ Bống làm cho anh một phần đặc biệt nha 💕",
    "Ba dưa trộn bánh tráng là ngon nhất quả đất!",
    "Anh Hiếu ghé chỉ để ngắm Sarose thôi 😳",
    "Molly ơi bán cho anh một bịch bánh tráng kèm nụ cười của Sa nhé!",
    "Món nào em làm cũng ngon nhất, anh ăn hết sạch luôn!",
    "Bà chủ đáng yêu quá, cho anh xin thêm một phần trái tim em nữa nha ❤️"
  ],

  // 7 câu nhắn ngắn từ "Hiếu (Tomortle)" cho quà điểm danh 7 ngày
  dailyCheckinMessages: [
    "Ngày 1: Chào buổi sáng Sarose! Hôm nay Bống nhớ ăn uống đầy đủ và đừng thức khuya quá nha 💕",
    "Ngày 2: Chúc bà chủ tiệm Bống tráng một ngày thật vui vẻ, bán đắt hàng như tôm tươi nè!",
    "Ngày 3: Dù bận gì thì Tomortle vẫn luôn nhớ tới Ba dưa đầu tiên. Cố lên bé yêu ❤️",
    "Ngày 4: Hôm nay Sa của anh đã cười chưa? Nhớ giữ gìn sức khoẻ để còn đi ăn bánh tráng với anh nhé!",
    "Ngày 5: Nửa tuần rồi! Tặng Molly thêm vốn nhập hàng để mở rộng tiệm Bống tráng thật to nha ✨",
    "Ngày 6: Cảm ơn Bống vì mỗi ngày đều mang lại niềm vui cho anh. Thương em nhiều lắm!",
    "Ngày 7: Quà đặc biệt cuối tuần dành cho bà chủ nhỏ của anh Hiếu! Yêu em nhất trên đời 💖"
  ],

  // Câu thả thính (nói lái / chuyển vế đổi dấu) — anh Hiếu ghé tiệm buông câu, Bống gõ "ý thật".
  // lines: các dòng của câu · answers: đáp án được chấp nhận (gõ không dấu cũng được)
  // note "CẦN KIỂM TRA": đáp án do Claude đoán, nhờ anh sửa lại cho đúng ý rồi xoá note.
  flirtLines: [
    { lines: ["nắng đã có ưng"], answers: ["nứng đã có anh"], note: "CẦN KIỂM TRA" },
    { lines: ["thích em vụng về, vừa dẫm lại vừa đi"], answers: ["vừa dâm vừa đĩ", "vừa dâm lại vừa đĩ"], note: "CẦN KIỂM TRA" },
    { lines: ["đốn thẳng vào lòng"], answers: ["lồn"], note: "CẦN KIỂM TRA" },
    { lines: ["em giản dị với cặp vớ quá cũ"], answers: ["cặp vú quá cỡ"] },
    { lines: ["làm ồn thì mình tỉnh"], answers: ["lồn"], note: "CẦN KIỂM TRA" },
    { lines: ["vớ nào cũng xù"], answers: ["vú nào cũng sờ", "vú nào cũng xờ"] },
    { lines: ["mừng cho em nó"], answers: ["nứng cho em mó"], note: "CẦN KIỂM TRA" },
    { lines: ["nến và rưng"], answers: ["nứng và rên", "rên và nứng"] },
    { lines: ["Anh lẻn vào đồn , vì nhớ cái lần em nhốt"], answers: ["lồn"], note: "CẦN KIỂM TRA" },
    { lines: ["Gọi em là sự thật", "Vì anh chỉ muốn vạch trần"], answers: ["lột trần em", "muốn lột đồ em"], note: "CẦN KIỂM TRA" },
    { lines: ["giỏi chịu đựng không ngù"], answers: ["giỏi chịu đụ không ngừng", "chịu đụ không ngừng"] },
    { lines: ["hoa nỡ lộn cành"], answers: ["lồn"], note: "CẦN KIỂM TRA" },
    { lines: ["đi chợ điểm gàm"], answers: ["gái điếm"], note: "CẦN KIỂM TRA" },
    { lines: ["vòng ngọc nhìn cưng"], answers: ["nhìn cu"], note: "CẦN KIỂM TRA" },
    { lines: ["đứng nêm"], answers: ["đêm nứng"] },
    { lines: ["cơm thu"], answers: ["cu thơm"] },
    { lines: ["lẩu đuôi bò"], answers: ["buồi"], note: "CẦN KIỂM TRA" },
    { lines: ["kịch đầy tăng"], answers: ["địt"], note: "CẦN KIỂM TRA" },
    { lines: ["anh tặng em bó hoa còn em cho anh bó tim"], answers: ["bím"] },
    { lines: ["bài duồi"], answers: ["buồi dài"] },
    { lines: ["công đầy lặc"], answers: ["cặc đầy lông"] },
    { lines: ["cuội long bào"], answers: ["buồi"], note: "CẦN KIỂM TRA" },
    { lines: ["đệm nguyên đu"], answers: ["đụ nguyên đêm"] },
    { lines: ["Tại nói chậm nghe rất duyên 🫶"], answers: ["nắm"], note: "CẦN KIỂM TRA" },
    { lines: ["ăn dấm đỡ tanh"], answers: ["dâm"], note: "CẦN KIỂM TRA" },
    { lines: ["dai với ngấm"], answers: ["dâm với ngài"], note: "CẦN KIỂM TRA" },
    { lines: ["gió bài"], answers: ["gái"], note: "CẦN KIỂM TRA" },
    { lines: ["ngưng là né"], answers: ["nứng"], note: "CẦN KIỂM TRA" },
    { lines: ["su biếng"], answers: ["sướng"], note: "CẦN KIỂM TRA" },
    { lines: ["su đầu vé"], answers: ["vú đầu se", "đầu vú se"], note: "CẦN KIỂM TRA" },
    { lines: ["thấy làm là anh hôn"], answers: ["thấy lồn là anh ham"] },
    { lines: ["làm gì cũng tốt"], answers: ["lồn"], note: "CẦN KIỂM TRA" },
    { lines: ["tuổi lông bìa"], answers: ["tỉa lông buồi"] },
    { lines: ["anh khôn lỏi thích em khôn loè"], answers: ["thích em khoe lồn", "khoe lồn"] },
    { lines: ["nụ con cưng"], answers: ["nựng con cu"] },
    { lines: ["chay gơi"], answers: ["chơi gay", "chơi gái"], note: "CẦN KIỂM TRA" },
    { lines: ["bống hườm"], answers: ["bướm hồng"] },
    { lines: ["cua chống"], answers: ["chống cu"], note: "CẦN KIỂM TRA" },
    { lines: ["gây cho em lú"], answers: ["lú"], note: "CẦN KIỂM TRA" },
    { lines: ["em thích bìm bịp còn anh thích bìm sớ"], answers: ["sờ bím", "bím sờ"] },
    { lines: ["ưng nên mới níu"], answers: ["nứng nên mới yêu", "nứng nên mới iu"] },
    { lines: ["em có thích máy bay đâu mà cứ hỏi em xem hàng không"], answers: ["xem hàng"], note: "CẦN KIỂM TRA" },
    { lines: ["nấm chuyện doi"], answers: ["nói chuyện dâm"] },
    { lines: ["mắc cọc ra"], answers: ["mọc cặc ra"] },
    { lines: ["kèm thu"], answers: ["thèm cu"] },
    { lines: ["tỉnh ri"], answers: ["rỉ tinh"] },
    { lines: ["sạc một lúc"], answers: ["sục"], note: "CẦN KIỂM TRA" },
    { lines: ["vang có màu tình"], answers: ["tình"], note: "CẦN KIỂM TRA" },
    { lines: ["sương trên khe lá"], answers: ["khe"], note: "CẦN KIỂM TRA" },
    { lines: ["voi cú"], answers: ["coi vú", "vú coi"] },
    { lines: ["bế em xem phim là ưng cảnh đấy"], answers: ["cảnh"], note: "CẦN KIỂM TRA" },
    { lines: ["thổi đều cho bừng nóng củi"], answers: ["buồi cứng"], note: "CẦN KIỂM TRA" },
    { lines: ["cược một lần thật căng"], answers: ["cặc một lần thật cương", "cặc cương"] },
    { lines: ["ráng làm để đủ đi chợ"], answers: ["đụ"], note: "CẦN KIỂM TRA" },
    { lines: ["chọn quà đừng lo tốn"], answers: ["lồn to"] },
    { lines: ["nước cốt dừa trong canh của u", "chúng đặc và trắng đục"], answers: ["tinh trùng", "tinh dịch"], note: "CẦN KIỂM TRA" },
    { lines: ["hôm nay nấu món tai và giò", "vần anh đảo rất bậy"], answers: ["giò"], note: "CẦN KIỂM TRA" },
    { lines: ["nhưng mà hôm nay hơi lười chơi chữ", "trừ chơi l-"], answers: ["chơi lồn"] },
    { lines: ["gọi em là mặt trời", "vì anh muốn thấy em đương sáng"], answers: ["đang sướng"] },
    { lines: ["Co lại nếu cai lọ", "To ra là do ta"], answers: ["quay lọ", "thủ dâm"], note: "CẦN KIỂM TRA" },
    { lines: ["dùng câu từ đùa vì anh đã muốn của từ đầu"], answers: ["cưa"], note: "CẦN KIỂM TRA" },
    { lines: ["dấm chua"], answers: ["dâm"], note: "CẦN KIỂM TRA" },
    { lines: ["bí tu"], answers: ["bú ti", "bú tí"] },
    { lines: ["xa không thể tỉnh"], answers: ["tỉnh"], note: "CẦN KIỂM TRA" },
    { lines: ["thiếu vàng là nợ"], answers: ["nợ"], note: "CẦN KIỂM TRA" },
    { lines: ["người dơi quá trầm"], answers: ["người dâm quá trời", "dâm quá trời"] },
    { lines: ["lạnh cóng em trong lò"], answers: ["lò"], note: "CẦN KIỂM TRA" },
    { lines: ["bù cho em nắm"], answers: ["bú"], note: "CẦN KIỂM TRA" },
    { lines: ["đinh trên đường tàu"], answers: ["tinh"], note: "CẦN KIỂM TRA" },
    { lines: ["em níu là anh ưng"], answers: ["em nứng là anh yêu", "em nứng là anh iu"] },
    { lines: ["Ảnh em quá đẹp nhưng anh muốn hỏi em cách nào in cho đẹp"], answers: ["địt"], note: "CẦN KIỂM TRA" },
    { lines: ["ảnh xịt rồi ảnh thoa"], answers: ["ảnh xoa rồi ảnh thịt", "xoa rồi thịt"] },
    { lines: ["Hoàng hôn nắng vàng"], answers: ["nàng"], note: "CẦN KIỂM TRA" },
    { lines: ["bố mới vừa mở tiệm photocopy", "bố bận vì nhiều em in"], answers: ["nhiều em", "bận vì nhiều em"], note: "CẦN KIỂM TRA" },
    { lines: ["Tuyển thư kí:", "Nữ yêu cầu IT căng và IELTS nuột", "Nam yêu cầu IQ khủng"], answers: ["ti căng", "cu khủng"] },
    { lines: ["Anh với em thi làm bánh đi, anh làm vị anh đào còn em làm vị anh đơ."], answers: ["đơ"], note: "CẦN KIỂM TRA" },
    { lines: ["em giảm cân à, anh thấy em toàn xương. xương nhất trình"], answers: ["xinh nhất trường"] },
    { lines: ["dạ chân rang"], answers: ["dang chân ra"] },
    { lines: ["Anh hậu đậu, em thì damdang"], answers: ["dâm đãng"] },
    { lines: ["Sang đây đi em hướng dẫn anh loại bỏ vảy cá"], answers: ["bỏ cả váy", "loại bỏ cả váy"] },
    { lines: ["cute nên nựng là đúng"], answers: ["cute nên nứng", "nứng"] },
    { lines: ["phải cùng nangf ăn tối", "anh mới thấy được quá trình xơi"], answers: ["trinh"], note: "CẦN KIỂM TRA" },
    { lines: ["lúc xào anh cũng thấy em ninh"], answers: ["lúc nào anh cũng thấy em xinh"] }
  ]
};
