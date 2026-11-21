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

  // ---------------- Mùa 2 ----------------
  // Thư mở Mùa 2 (hiện khi bấm "Mùa 2 mở rồi!" ở Menu)
  season2Intro: "Bà chủ ơi, tiệm mình đông khách quá rồi. Anh nghĩ mình mở thêm quầy chè với sữa chua đi, trời nóng ai cũng thèm. Anh sẽ phụ em một tay. Mình bắt đầu Mùa 2 nha 🍧",
  // Thư kết Mùa 2 (màn kết sau mốc 30 Mùa 2)
  ending2: "Vậy là quầy chè cũng chạy ngon lành rồi. Cảm ơn em đã cùng anh đi thêm một mùa nữa. Mỗi ly chè em xếp, anh đều đứng bên cạnh nhìn, và lần nào cũng thấy mình may mắn. Mùa sau mình làm gì tiếp nhỉ? Em chọn đi, anh theo 💕",
  // Lời nhắn khi đủ 15 Trái tim vàng Mùa 2
  bonusMessage2: "15 Trái tim vàng Mùa 2! Bà chủ đỉnh thật sự. Chụp màn hình này gửi anh để đổi một buổi đi ăn chè ngoài đời nha, anh bao 🍧💛",
  // 15 thẻ công thức Mùa 2, mở lần lượt ở 15 mốc lớn
  recipeCards2: [
    { title: "Chè đậu xanh", text: "Món đầu tiên của quầy chè. Đậu xanh nấu nhừ, rưới nước cốt dừa béo béo. Đơn giản mà ai ăn cũng nhớ." },
    { title: "Sữa chua đá", text: "Sữa chua đánh đá lạnh buốt, chua chua ngọt ngọt. Trưa hè ăn một ly là hết mệt." },
    { title: "Chè đậu đỏ", text: "Đậu đỏ ninh mềm, ngọt thanh. Nghe nói ăn đậu đỏ là gặp may, nên ly đầu tiên dành cho bà chủ." },
    { title: "Chè sương sáo", text: "Sương sáo đen mát lạnh, giòn giòn trong miệng. Món giải nhiệt của mấy chú xe ôm đầu hẻm." },
    { title: "Sữa chua mít", text: "Mít vàng thơm lừng dưới đáy, sữa chua phủ lên trên. Xếp ngược là mất ngon liền." },
    { title: "Chè thập cẩm", text: "Đậu xanh, đậu đỏ, thạch, nước cốt dừa. Bốn lớp, bốn màu, ăn một muỗng có đủ cả." },
    { title: "Sữa chua nếp cẩm", text: "Nếp cẩm tím dẻo thơm, ăn cùng sữa chua là hết sẩy. Món ruột của mấy bạn văn phòng." },
    { title: "Chè Thái", text: "Mít, thạch, trân châu, nước cốt dừa. Ly nào cũng đầy ụ, cầm lên thấy nặng tay." },
    { title: "Sữa chua trân châu", text: "Trân châu dai dai nằm dưới, sữa chua mát lạnh ở trên. Học sinh tan trường xếp hàng mua." },
    { title: "Chè dừa non", text: "Thạch dừa non trong veo, rắc thêm dừa nạo. Ăn chậm thôi kẻo hết." },
    { title: "Chè ba màu", text: "Đỏ, vàng, xanh như đèn giao thông. Cô Hạnh nói ly này nhìn là thấy vui." },
    { title: "Sữa chua dừa", text: "Sữa chua hoà nước cốt dừa, rắc dừa nạo. Béo ngậy mà không ngán." },
    { title: "Combo Mùa Hè", text: "Một ly chè Thái, một ly trà tắc. Mùa hè chỉ cần vậy là đủ." },
    { title: "Chè đặc biệt", text: "Sáu lớp, xếp lâu nhất tiệm. Bà chủ làm ly này là cả hẻm đứng xem." },
    { title: "Ly Chè Hẹn Hò", text: "Món cuối của Mùa 2, chỉ làm cho người đặc biệt. Ăn chung một ly, hai cái muỗng." }
  ],
  // Kỷ niệm Mùa 2 (tuỳ chọn). Thêm như memories ở trên, phần tử thứ k mở ở mốc lớn thứ k của Mùa 2.
  memories2: [],

  // ---------------- Anh Hiếu phụ tiệm (Mùa 2) ----------------
  // Câu anh nói khi đang phụ tiệm (bong bóng thoại)
  helperLines: [
    "Bà chủ ơi, khách bàn hai khen chè ngon kìa!",
    "Anh rửa ly xong rồi nè, khen anh đi 😌",
    "Em làm nhanh quá, anh theo không kịp luôn.",
    "Nghỉ tay uống miếng nước đi em.",
    "Ai cho em dễ thương dữ vậy, tập trung bán hàng đi chứ!",
    "Anh mới học được cách xếp chè ba màu, giỏi chưa?",
    "Hôm nay đông ghê, tối anh đấm lưng cho nha.",
    "Khách hỏi anh có phải chủ tiệm không, anh nói anh là chồng... à nhầm, là nhân viên.",
    "Trân châu hết thì kêu anh nha.",
    "Em cười cái là khách quay lại liền á.",
    "Anh xin nghỉ trưa 5 phút để ngắm bà chủ.",
    "Ly này anh bưng, em cứ làm ly kế đi.",
    "Mệt hông? Mệt thì để anh lo.",
    "Anh làm đổ có xíu nước thôi, em đừng nhìn anh vậy 😅",
    "Hôm nay mình bán được nhiều ghê, tối ăn gì ăn đi!",
    "Sương sáo này đen như... à thôi, anh không dám so.",
    "Anh phụ tiệm không lương mà vui nhất thế giới.",
    "Em có thấy anh chạy bàn chuyên nghiệp chưa?",
    "Khách đi rồi, giờ tới lượt anh được em phục vụ hông?",
    "Mai mình mở sớm hơn chút nha, anh dậy sớm được."
  ],
  // Chương "Sau giờ đóng cửa": chương 1 khi anh vào phụ, chương 2/3 khi lên cấp ăn ý
  helperChapters: [
    {"text": "Đóng cửa xong, anh ngồi lau từng cái ly, còn em đếm tiền trong hộp. Anh hỏi: \"Hôm nay em có vui không?\"", "choices": [{"label": "Vui chứ, có anh phụ mà", "reply": "Anh cười tít mắt, lau ly nhanh gấp đôi.", "effect": {"wallet": 20}}, {"label": "Mệt nhưng vui", "reply": "Anh lấy ghế cho em ngồi, tự đếm tiền giùm.", "effect": {"wallet": 10}}]},
    {"text": "Trời đổ mưa lúc dọn tiệm. Anh lấy cái áo mưa duy nhất trùm cho em, còn mình thì ướt nhẹp. \"Không sao, anh khoẻ mà.\"", "choices": [{"label": "Che chung đi, ngốc", "reply": "Hai người chen chúc dưới một cái áo mưa, đi về chậm hơn mọi hôm.", "effect": {"wallet": 30}}, {"label": "Lau đầu cho anh", "reply": "Anh đứng im ngoan ngoãn, mặt đỏ hơn ly chè đậu đỏ.", "effect": {"wallet": 30}}]},
    {"text": "Tối nay anh khoá cửa tiệm rồi kéo em ra đầu hẻm ăn khuya. \"Cả mùa em làm giỏi quá, hôm nay để anh bao.\"", "choices": [{"label": "Ăn bánh tráng nướng tiệm khác thử", "reply": "Ăn xong hai người kết luận: tiệm mình vẫn ngon nhất.", "effect": {"wallet": 50}}, {"label": "Về tiệm ăn chè anh làm", "reply": "Anh làm ly chè hơi sai thứ tự, nhưng em vẫn ăn hết.", "effect": {"wallet": 50}}]}
  ],
  helperIntro: "Anh xin vào phụ tiệm nha bà chủ. Lương anh là được đứng gần em là đủ rồi 😌",
  helperLate: "Anh tới trễ xíu, kẹt xe quá trời, em thông cảm nha 🙏",
  helperSpill: "Ui da... anh lỡ làm đổ một chút {ing}, để anh dọn liền!",

  // Lời nhắn mỗi ngày: mở một câu khi chơi Thử thách hôm nay lần đầu trong ngày (lần lượt, hết thì quay lại).
  // Sửa thoải mái; thêm câu mới thì thêm vào cuối.
  dailyNotes: [
    "Hôm nay có mệt thì nghỉ chút cũng được, tiệm vẫn ở đây chờ.",
    "Uống một ly nước trước khi làm gì tiếp nha.",
    "Không cần làm mọi thứ hoàn hảo, làm xong là giỏi rồi.",
    "Có chuyện gì vui hôm nay thì kể anh nghe với.",
    "Ăn sáng chưa đó? Bánh tráng không tính là bữa chính đâu nha.",
    "Một ngày bình thường cũng là một ngày đáng nhớ.",
    "Nếu hôm nay hơi tệ thì mai mình làm lại, không sao hết.",
    "Nhớ đứng dậy vươn vai một cái, ngồi lâu mỏi lưng đó.",
    "Cảm ơn vì hôm nay vẫn mở game ghé tiệm.",
    "Đi ngủ sớm một bữa đi, mai dậy sẽ thấy khác liền.",
    "Việc khó nhất thường là bắt đầu. Bắt đầu rồi thì nhẹ hơn nhiều.",
    "Hôm nay thử khen bản thân một câu xem.",
    "Trời có nắng thì nhớ đội nón, có mưa thì nhớ mang áo mưa.",
    "Không ai giỏi ngay từ đầu, bà chủ cũng từng làm cháy bánh mà.",
    "Chậm một chút cũng được, miễn là vẫn đi tiếp.",
    "Ra ngoài hít thở năm phút, đầu óc sẽ nhẹ hơn.",
    "Có ai làm phiền thì cứ kệ, giữ năng lượng cho việc mình thích.",
    "Một bữa ăn ngon cũng đáng để vui cả buổi chiều.",
    "Mệt thì nói mệt, không cần lúc nào cũng phải ổn.",
    "Hôm nay nghe một bài nhạc cũ mình từng thích đi.",
    "Nhớ nhắn hỏi thăm ba mẹ một câu nha.",
    "Làm được một việc nhỏ thôi cũng tính là tiến bộ.",
    "Đừng so mình với người khác, mỗi người một con đường.",
    "Dọn bàn gọn gọn chút, tự nhiên thấy dễ làm việc hơn.",
    "Ngủ đủ giấc là bí quyết làm đẹp rẻ nhất.",
    "Có kế hoạch gì cho cuối tuần chưa?",
    "Hôm nay thử làm một việc chưa từng làm, nhỏ thôi cũng được.",
    "Chuyện buồn rồi cũng qua, chuyện vui thì nhớ giữ lại.",
    "Đừng quên bôi kem chống nắng nha.",
    "Đôi khi không làm gì cũng là một cách nghỉ ngơi.",
    "Ăn rau đi, khô bò không thay được rau đâu.",
    "Có ai đó đang tự hào về em mà em không biết đó.",
    "Viết ra ba điều em biết ơn hôm nay xem.",
    "Sai thì sửa, không cần tự trách lâu.",
    "Hôm nay nhớ cười ít nhất một lần thật to.",
    "Cái gì quan trọng thì làm trước, cái gì vui thì để làm phần thưởng.",
    "Điện thoại hết pin thì sạc, người hết pin thì ngủ.",
    "Tiệm đông hay vắng thì bà chủ vẫn là bà chủ giỏi nhất.",
    "Đi bộ một vòng sau bữa tối, tốt cho bụng lắm.",
    "Đừng ôm hết việc một mình, nhờ người khác cũng được mà.",
    "Hôm nay trời đẹp không? Nhìn ra cửa sổ một chút đi.",
    "Học thêm một điều mới, dù chỉ là một từ tiếng Anh.",
    "Ước mơ lớn hay nhỏ cũng đáng để theo đuổi.",
    "Nhớ mang theo đồ ăn vặt phòng khi đói giữa buổi.",
    "Thất bại một lần không nói lên điều gì hết.",
    "Nghỉ tay pha một ly trà ấm đi.",
    "Những ngày bình yên là những ngày đáng quý nhất.",
    "Đừng thức khuya xem phim nữa nha, mai còn đi làm.",
    "Hôm nay em đã cố gắng rồi, vậy là đủ.",
    "Có gì lo lắng thì viết ra giấy, đỡ nghĩ hơn nhiều.",
    "Thử nấu một món mới cuối tuần này xem.",
    "Người tử tế thì luôn có người tử tế lại với mình.",
    "Đừng bỏ bữa trưa vì bận, bận mấy cũng phải ăn.",
    "Nhìn lại một tháng trước, em đã đi được xa lắm rồi.",
    "Hôm nay nhắn cho một người bạn lâu rồi chưa nói chuyện đi.",
    "Giữ ấm cổ khi trời trở gió nha.",
    "Nếu thấy rối thì dừng lại, hít sâu ba lần.",
    "Mỗi ngày một chút, rồi sẽ thành nhiều.",
    "Không phải ngày nào cũng vui, nhưng ngày nào cũng có điều đáng nhớ.",
    "Hẹn gặp lại ở tiệm ngày mai nha."
  ],

  // Chuyện vặt: hiện khi qua một mốc nhỏ (lần lượt, hết thì quay lại). Thêm câu mới thì thêm vào cuối.
  minorTales: [
    { who: "Chị Lan Kế Toán", text: "Chị vừa cân đối sổ sách xong, lệch đúng 5 nghìn. Hoá ra là tiền chị ăn bánh tráng hôm qua chưa ghi 😅" },
    { who: "Chú Tư Xe Ôm", text: "Hôm nay chú chở một ông khách, ổng hỏi đường tới tiệm {shop}. Chú nói: lên xe, chú chở miễn phí!" },
    { who: "Bé Na Lớp 10", text: "Chị ơi, em được 9 điểm Văn! Cô khen em tả món bánh tráng cuốn hay quá trời 📝" },
    { who: "Anh shipper", text: "Anh giao 40 đơn hôm nay, đơn nào khách cũng hỏi: tiệm bánh tráng đầu hẻm còn mở không anh?" },
    { who: "Bà cụ", text: "Hồi bà còn con gái, bà cũng bán bánh tráng nè. Nhìn con là bà nhớ thời đó ghê." },
    { who: "Học sinh", text: "Tụi em lập nhóm chat tên 'Hội ăn bánh tráng chị chủ' rồi đó chị, 37 thành viên!" },
    { who: "Chị Lan Kế Toán", text: "Sếp chị mới hỏi sao dạo này chị vui vậy. Chị nói: tại tan làm có chỗ ghé ăn đó anh." },
    { who: "Chú Tư Xe Ôm", text: "Bé Út cháu chú vẽ cái tiệm của con lên bài tập mỹ thuật, được điểm 10 luôn!" },
    { who: "Bé Na Lớp 10", text: "Em tập làm bánh tráng trộn ở nhà, mẹ ăn xong nói: thôi mai ra tiệm chị chủ mua cho rồi 😂" },
    { who: "Anh shipper", text: "Mưa quá trời mà nhìn đèn tiệm còn sáng là anh thấy ấm bụng liền." },
    { who: "Bà cụ", text: "Bà kể chuyện con cho mấy bà hàng xóm nghe, giờ cả xóm đòi ghé thử." },
    { who: "Học sinh", text: "Thầy chủ nhiệm bắt gặp tụi em ăn bánh tráng, thầy… xin một miếng rồi đi luôn." },
    { who: "Chị Lan Kế Toán", text: "Hôm nay chị được tăng lương nè! Mai chị bao cả phòng ăn bánh tráng của em." },
    { who: "Chú Tư Xe Ôm", text: "Chú mới thay cái yên xe mới, khách khen êm. Chú nói: êm như bánh tráng phơi sương tiệm con đó!" },
    { who: "Bé Na Lớp 10", text: "Chị ơi, sau này lớn em muốn mở tiệm giống chị. Chị nhận em làm học trò nha!" },
    { who: "Anh shipper", text: "Có khách đặt 'bánh tráng như hôm qua', anh hỏi hôm qua là món gì, khách nói: món làm em vui á anh." },
    { who: "Bà cụ", text: "Bà mang cho con mấy trái tắc nhà bà trồng nè, vắt vô ly trà là thơm phức." },
    { who: "Học sinh", text: "Tụi em thi xong rồi chị ơi! Ăn mừng bằng bánh tráng là chuẩn bài." },
    { who: "Chị Lan Kế Toán", text: "Chị tính rồi: một tuần chị ghé tiệm em 5 lần. Thôi coi như đây là… chi phí hạnh phúc." },
    { who: "Bé Na Lớp 10", text: "Hôm nay em không đói đâu, em ghé chỉ để chào chị thôi đó 👋" }
  ],

  // Câu thả thính dễ thương (nói lái / chơi chữ) — anh Hiếu ghé tiệm buông câu, Bống gõ "ý thật".
  // lines: các dòng của câu · answers: cả câu "ý thật". Bống phải gõ cả câu (gõ không dấu, viết hoa cũng được).
  // Thêm câu mới thì chép một dòng { lines: [...], answers: [...] }, và luôn THÊM VÀO CUỐI danh sách.
  flirtLines: [
    { lines: ["dùng câu từ đùa vì anh đã muốn của từ đầu"], answers: ["dùng câu từ đùa vì anh đã muốn cua từ đầu"] },
    { lines: ["xa không thể tỉnh"], answers: ["xinh không thể tả"] },
    { lines: ["thiếu vàng là nợ"], answers: ["thiếu vợ là nàng"] },
    { lines: ["đinh trên đường tàu"], answers: ["đau trên đường tình"] },
    { lines: ["Hoàng hôn nắng vàng"], answers: ["Hoàng hôn vắng nàng"] },
    { lines: ["bố bận vì nhiều em in"], answers: ["bố bận vì nhìn em yêu"] },
    { lines: ["Anh với em thi làm bánh đi, anh làm vị anh đào còn em làm vị anh đơ."], answers: ["Anh với em thi làm bánh đi, anh làm vị anh đào còn em làm vợ anh đi"] },
    { lines: ["em giảm cân à, anh thấy em toàn xương. xương nhất trình"], answers: ["em giảm cân à, anh thấy em toàn xương. xinh nhất trường"] },
    { lines: ["phải cùng nangf ăn tối", "anh mới thấy được quá trình xơi"], answers: ["phải cùng nàng ăn tối anh mới thấy được quá trời xinh"] },
    { lines: ["lúc xào anh cũng thấy em ninh"], answers: ["lúc nào anh cũng thấy em xinh"] }
  ]
};
