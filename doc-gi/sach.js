// Kệ sách của Yên, dùng cho trò "Hôm nay đọc gì?".
//
// CHỦ QUÁN SỬA Ở ĐÂY: mỗi dòng là một cuốn (hoặc một món) trên kệ.
//   ten    tên sách
//   tacgia tác giả (để trống "" nếu không có)
//   ngan   ngăn trên kệ: "cuoi" | "am" | "nam" | "con" | "khong"
//   phut   cần ít nhất bao nhiêu phút để đọc cho đã: 5, 15 hoặc 30 (ước chừng, không phải số đo)
//   vi     một câu ngắn vì sao nên cầm cuốn này
//
// DU_KIEN = true nghĩa là kệ chưa mua xong, đây mới là danh sách dự kiến. Trang sẽ nói rõ điều đó với khách.
// Khi kệ đã có đúng những cuốn dưới đây, đổi thành false.
window.YEN_SACH_DU_KIEN = true;

window.YEN_SACH = [
  // ── đọc là cười
  { ten: 'Nhật ký Mèo Mốc', tacgia: 'Đặng Quang Dũng', ngan: 'cuoi', phut: 5, vi: 'Mỗi trang một mẩu. Mở đâu cười đó.' },
  { ten: 'Thỏ Bảy Màu: Timeline của tui có gì', tacgia: 'Huỳnh Thái Ngọc', ngan: 'cuoi', phut: 5, vi: 'Con thỏ lầy trên mạng, giờ nằm trên giấy.' },
  { ten: 'Doraemon truyện ngắn', tacgia: 'Fujiko F. Fujio', ngan: 'cuoi', phut: 5, vi: 'Vài phút là xong một chuyện. Ai cũng từng đọc.' },
  { ten: 'Nhóc Nicolas', tacgia: 'René Goscinny và Jean-Jacques Sempé', ngan: 'cuoi', phut: 15, vi: 'Một đám nhóc phá như giặc. Mỗi chuyện vài trang.' },
  { ten: 'Những người thích đùa', tacgia: 'Aziz Nesin', ngan: 'cuoi', phut: 15, vi: 'Truyện cười ngắn, dành cho người lớn.' },

  // ── ấm lòng, đọc dở được
  { ten: 'Hoàng tử bé', tacgia: 'Antoine de Saint-Exupéry', ngan: 'am', phut: 15, vi: 'Mỏng thôi. Đọc lại lần nào cũng thấy khác.' },
  { ten: 'Totto-chan bên cửa sổ', tacgia: 'Kuroyanagi Tetsuko', ngan: 'am', phut: 15, vi: 'Mỗi chương một chuyện nhỏ ở một ngôi trường rất lạ.' },
  { ten: 'Cho tôi xin một vé đi tuổi thơ', tacgia: 'Nguyễn Nhật Ánh', ngan: 'am', phut: 15, vi: 'Người lớn đọc để nhớ hồi mình tám tuổi.' },
  { ten: 'Khi tách cà phê còn chưa nguội', tacgia: 'Kawaguchi Toshikazu', ngan: 'am', phut: 30, vi: 'Chuyện xảy ra trong một quán cà phê nhỏ. Hợp chỗ bạn đang ngồi ghê.' },
  { ten: 'Điều kỳ diệu của tiệm tạp hóa Namiya', tacgia: 'Higashino Keigo', ngan: 'am', phut: 30, vi: 'Ba tên trộm trốn trong tiệm tạp hóa cũ, rồi thư từ ngày xưa cứ rơi vô.' },
  { ten: 'Chuyện con mèo dạy hải âu bay', tacgia: 'Luis Sepúlveda', ngan: 'am', phut: 30, vi: 'Một con mèo lỡ hứa nuôi một con hải âu.' },
  { ten: 'Tôi thấy hoa vàng trên cỏ xanh', tacgia: 'Nguyễn Nhật Ánh', ngan: 'am', phut: 30, vi: 'Hai anh em ở một làng quê nghèo. Chương nào cũng ngắn.' },
  { ten: 'Cây cam ngọt của tôi', tacgia: 'José Mauro de Vasconcelos', ngan: 'am', phut: 30, vi: 'Cậu bé Zezé và cây cam biết nói chuyện. Có đoạn buồn nha.' },

  // ── miền Nam mình
  { ten: 'Tản văn Nguyễn Ngọc Tư', tacgia: 'Nguyễn Ngọc Tư', ngan: 'nam', phut: 5, vi: 'Mỗi bài vài trang. Đọc xong muốn về quê.' },
  { ten: 'Hương rừng Cà Mau', tacgia: 'Sơn Nam', ngan: 'nam', phut: 15, vi: 'Truyện ngắn Nam Bộ, kể như ông Hai ngồi đầu ngõ.' },
  { ten: 'Đất rừng phương Nam', tacgia: 'Đoàn Giỏi', ngan: 'nam', phut: 30, vi: 'Theo cậu bé An lang thang khắp miền Tây.' },

  // ── cho trẻ em và ba mẹ
  { ten: 'Sách tranh ít chữ', tacgia: '', ngan: 'con', phut: 5, vi: 'Nhiều hình, ít chữ. Con coi, ba mẹ uống nước.' },
  { ten: 'Sách tìm hình', tacgia: '', ngan: 'con', phut: 5, vi: 'Tìm cho ra một nhân vật trong cả đám đông. Không cần biết chữ.' },
  { ten: 'Dế Mèn phiêu lưu ký', tacgia: 'Tô Hoài', ngan: 'con', phut: 15, vi: 'Đọc cho con nghe, hoặc đọc cho chính mình.' },

  // ── không cần đọc
  { ten: 'Sổ "Viết gì đó cho Yên"', tacgia: '', ngan: 'khong', phut: 5, vi: 'Cuốn sổ trắng. Vẽ một cái, viết một câu, vậy thôi.' },
  { ten: 'Ô chữ tiếng Việt', tacgia: '', ngan: 'khong', phut: 5, vi: 'Điền được ô nào hay ô đó.' },
  { ten: 'Sách ảnh cà phê và trà', tacgia: '', ngan: 'khong', phut: 5, vi: 'Lật coi hình. Khỏi đọc chữ nào.' },
  { ten: 'Sách tô màu', tacgia: '', ngan: 'khong', phut: 15, vi: 'Có sẵn bút chì màu. Tô lem cũng được.' },
  { ten: 'Sudoku', tacgia: '', ngan: 'khong', phut: 15, vi: 'Chín ô, chín số, một ly nước.' }
];
