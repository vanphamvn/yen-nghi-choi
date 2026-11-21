// Một Ca Không Yên · 4 tình huống hư cấu dựa trên những rủi ro vận hành quán.
// Dữ liệu tĩnh, không có người dùng thực hay dữ liệu được gửi đi.
export const DIMENSIONS = [
  { key: "safety", label: "An toàn" },
  { key: "trust", label: "Niềm tin" },
  { key: "flow", label: "Nhịp quán" },
  { key: "budget", label: "Chi phí" }
];

export const STARTING_STATS = Object.freeze({ safety: 65, trust: 55, flow: 55, budget: 60 });

export const SCENARIOS = [
  {
    id: "nuoc-do", number: "01", title: "Vũng nước lúc 17:30", place: "Quầy pha chế", weather: "Chiều đông khách",
    description: "Bảy đơn đang chờ. Một bình nước đổ ra lối đi sát quầy.",
    lesson: "Cô lập nguy cơ trước, phân vai rõ ràng, rồi nói thật với khách về việc đang chậm.",
    beats: [
      {
        time: "17:30", speaker: "Người dẫn chuyện",
        line: "Tiếng bình rơi. Nước lan từ quầy ra lối khách đi. Máy pha vẫn chạy, bảy ly còn chờ.",
        question: "Bạn làm gì trước?",
        choices: [
          {
            text: "Tạm dừng nhận đơn, chặn lối trơn, gọi người hỗ trợ và báo khách đang chờ.",
            replySpeaker: "Khách ở bàn gần cửa",
            reply: "“Ừ, cứ xử lý cho an toàn đã. Cho em biết đơn chờ khoảng bao lâu nhé.”",
            effect: { safety: 24, trust: 12, flow: -8, budget: -2 },
            reason: "Bạn giữ khách tránh xa khu vực nguy hiểm, đồng thời không để họ đoán mò vì sao đơn chậm.",
            followUp: "Lối đi đã được khoanh lại. Khách đang chờ biết quán có sự cố."
          },
          {
            text: "Trải khăn lên nước, tiếp tục nhận đơn để không mất khách.",
            replySpeaker: "Một vị khách",
            reply: "“Chỗ đó vẫn ướt mà. Có ai vừa suýt trượt đấy!”",
            effect: { safety: -30, trust: -12, flow: 6, budget: 0 },
            reason: "Khăn không thay thế việc cô lập và xử lý chỗ trơn. Thêm đơn khiến người làm càng phân tán.",
            followUp: "Lối đi vẫn trơn. Một vị khách đã phải né sang bên."
          },
          {
            text: "Tự lau ngay, không nói gì để khách khỏi lo.",
            replySpeaker: "Người đang chờ lấy nước",
            reply: "“Em hỏi đơn số 12 với ạ. Sao quầy im lặng vậy?”",
            effect: { safety: 5, trust: -9, flow: -16, budget: 0 },
            reason: "Bạn có xử lý nước đổ nhưng bỏ trống việc báo hiệu khu vực nguy hiểm và giao tiếp với khách.",
            followUp: "Sàn bớt ướt, nhưng khách chưa biết vì sao quán đột ngột chậm."
          }
        ]
      },
      {
        time: "17:36", speaker: "Khách chờ đơn",
        line: "“Ly của em tới đâu rồi ạ? Em còn phải về đón con.” Hàng chờ bắt đầu xôn xao.",
        question: "Bạn trả lời thế nào?",
        choices: [
          {
            text: "Xin lỗi, kiểm tra thứ tự đơn, báo thời gian dự kiến và cho khách quyền hủy nếu không chờ được.",
            replySpeaker: "Khách chờ đơn",
            reply: "“Em hiểu rồi. Vậy em đợi thêm chút nhé.”",
            effect: { safety: 3, trust: 20, flow: 3, budget: -4 },
            reason: "Một mốc thời gian có căn cứ và lựa chọn rõ ràng giúp khách tự quyết, tránh lời hứa quá mức.",
            followUp: "Khách được cập nhật và hàng chờ có thứ tự rõ hơn."
          },
          {
            text: "Nói “sắp xong hết” dù chưa kiểm tra đơn nào.",
            replySpeaker: "Khách chờ đơn",
            reply: "“Nhưng nãy anh cũng nói vậy rồi.”",
            effect: { safety: 0, trust: -20, flow: -4, budget: 1 },
            reason: "Hứa nhanh hơn thực tế khiến cảm giác bị bỏ quên tăng lên.",
            followUp: "Một khách đã mất kiên nhẫn vì lời hẹn không chính xác."
          },
          {
            text: "Mời nước lọc rồi tiếp tục pha, không giải thích thêm.",
            replySpeaker: "Khách chờ đơn",
            reply: "“Cảm ơn, nhưng em cần biết bao giờ lấy được ly đã đặt.”",
            effect: { safety: 0, trust: 4, flow: -3, budget: -7 },
            reason: "Một cử chỉ tử tế có ích, nhưng không thay cho thông tin mà khách cần.",
            followUp: "Khách có nước uống trong lúc chờ nhưng vẫn thiếu một thời gian nhận đơn cụ thể."
          }
        ]
      },
      {
        time: "17:42", speaker: "Người dẫn chuyện",
        line: "Một bé nhỏ đang định bước vào phía lối đi còn ẩm. Đồng thời, khách mới tiến đến quầy gọi nước.",
        question: "Bạn ưu tiên điều gì?",
        choices: [
          {
            text: "Giữ lối đi được ngăn rõ, nhờ người hướng dẫn khách và chỉ mở lại khi sàn đã khô.",
            replySpeaker: "Người nhà của bé",
            reply: "“Cảm ơn quán đã nhắc. Bé nhà em hiếu động lắm.”",
            effect: { safety: 22, trust: 12, flow: -6, budget: -2 },
            reason: "Đừng vì đông khách mà bỏ rào chắn sớm. Tín hiệu an toàn cần đủ rõ với cả trẻ nhỏ.",
            followUp: ""
          },
          {
            text: "Dẹp vật chắn để khách dễ đến quầy, dặn miệng “coi chừng trơn”.",
            replySpeaker: "Người nhà của bé",
            reply: "“Em không biết khu này vẫn chưa khô.”",
            effect: { safety: -32, trust: -15, flow: 5, budget: 0 },
            reason: "Nhắc miệng không đủ khi nguy cơ vẫn tồn tại, đặc biệt tại nơi có trẻ em.",
            followUp: ""
          },
          {
            text: "Đóng quầy cả buổi dù lối đi đã có thể xử lý xong.",
            replySpeaker: "Nhân viên",
            reply: "“Mình có thể kiểm tra và mở lại từng khu an toàn, khỏi đóng hết quán không?”",
            effect: { safety: 8, trust: -2, flow: -24, budget: -12 },
            reason: "Thận trọng là đúng, nhưng có thể mở lại có kiểm soát sau khi kiểm tra hết nguy cơ.",
            followUp: ""
          }
        ]
      }
    ]
  },
  {
    id: "do-uong", number: "02", title: "Ly trà quá ngọt", place: "Quầy nhận nước", weather: "Cuối buổi sáng",
    description: "Khách nói ly trà không đúng khẩu vị. Sau lưng họ là ba người chờ nhận món.",
    lesson: "Lắng nghe cụ thể, giải quyết đúng vấn đề, xác nhận đồ uống trước khi kết thúc khiếu nại.",
    beats: [
      {
        time: "10:45", speaker: "Khách",
        line: "“Em dặn ít ngọt mà ly này ngọt quá. Chị uống không được.” Khách đặt ly xuống quầy.",
        question: "Bạn đáp lại ra sao?",
        choices: [
          {
            text: "Xin lỗi, đối chiếu đơn và đề nghị pha lại theo mức ngọt khách xác nhận.",
            replySpeaker: "Khách",
            reply: "“Vậy cho chị nhạt hơn rõ một chút nhé, cảm ơn em.”",
            effect: { safety: 7, trust: 22, flow: -7, budget: -9 },
            reason: "Bạn xử lý từ nhu cầu thực của khách, dù quán tốn thêm thời gian và nguyên liệu.",
            followUp: "Khách đồng ý cho quán làm lại. Bạn đã ghi rõ mức ngọt được xác nhận."
          },
          {
            text: "Giải thích công thức chuẩn của quán vốn ngọt như vậy.",
            replySpeaker: "Khách",
            reply: "“Nhưng chị đã dặn ít đường từ đầu.”",
            effect: { safety: 0, trust: -25, flow: 5, budget: 4 },
            reason: "Bảo vệ công thức không giải quyết sự khác biệt giữa đơn đặt và ly khách nhận.",
            followUp: "Khách có vẻ không muốn tranh luận nữa, nhưng vẫn chưa có ly uống được."
          },
          {
            text: "Giảm giá cho ly hiện tại và mời khách nhận tiếp.",
            replySpeaker: "Khách",
            reply: "“Chị không cần giảm giá, chị muốn uống được cơ.”",
            effect: { safety: 0, trust: -4, flow: 1, budget: -12 },
            reason: "Bồi hoàn tài chính không phải lúc nào cũng thay thế được việc sửa lỗi sản phẩm.",
            followUp: "Bạn đã đề nghị giảm giá, nhưng vấn đề khẩu vị vẫn còn."
          }
        ]
      },
      {
        time: "10:49", speaker: "Khách phía sau",
        line: "“Ủa đơn của em đến trước mà sao ly khác lại được làm trước?”",
        question: "Xử lý thứ tự làm món thế nào?",
        choices: [
          {
            text: "Giải thích đang sửa một đơn lỗi, kiểm tra hàng chờ và giao người làm các đơn còn lại.",
            replySpeaker: "Khách phía sau",
            reply: "“Dạ, nói vậy em hiểu. Em đợi thêm được.”",
            effect: { safety: 0, trust: 14, flow: 12, budget: -2 },
            reason: "Phân vai và minh bạch thứ tự giúp tránh biến một lời phàn nàn thành nhiều lời phàn nàn.",
            followUp: "Các đơn còn lại tiếp tục được xử lý theo thứ tự đã cập nhật."
          },
          {
            text: "Bỏ dở ly làm lại để quay sang phục vụ khách đang hỏi to.",
            replySpeaker: "Khách ban đầu",
            reply: "“Vậy cuối cùng ly của chị có được làm lại không em?”",
            effect: { safety: 0, trust: -16, flow: -12, budget: -3 },
            reason: "Đổi ưu tiên liên tục mà không giải thích khiến cả hai phía cùng mất niềm tin.",
            followUp: "Cả hai khách đều không chắc đơn của mình đang ở đâu."
          },
          {
            text: "Tự làm hết mọi đơn, không nhờ người khác vì ngại gây phiền.",
            replySpeaker: "Người cùng ca",
            reply: "“Anh cần em phụ phần nào thì cứ nói, đừng ôm hết.”",
            effect: { safety: 0, trust: 1, flow: -18, budget: 1 },
            reason: "Trong giờ đông, không phân vai là một nút thắt vận hành dễ tránh.",
            followUp: "Quầy vẫn tắc do một người xử lý mọi việc."
          }
        ]
      },
      {
        time: "10:55", speaker: "Khách ban đầu",
        line: "“Chị nhận ly mới rồi. Để chị thử một ngụm nhé…”",
        question: "Bạn kết thúc tình huống ra sao?",
        choices: [
          {
            text: "Hỏi lại mức ngọt đã phù hợp chưa, cảm ơn khách góp ý và kiểm tra quy trình ghi chú đơn.",
            replySpeaker: "Khách",
            reply: "“Ly này ổn rồi. Lần sau chị sẽ dặn kỹ hơn.”",
            effect: { safety: 6, trust: 19, flow: 5, budget: -2 },
            reason: "Xác nhận kết quả và tìm điểm lỗi trong quy trình giúp giảm nguy cơ lặp lại.",
            followUp: ""
          },
          {
            text: "Đưa ly xong là quay đi ngay vì còn đông khách.",
            replySpeaker: "Khách",
            reply: "“Chị chưa kịp nói ly này đã đúng chưa…”",
            effect: { safety: 0, trust: -8, flow: 7, budget: 1 },
            reason: "Chỉ thêm một câu xác nhận có thể chặn một vòng khiếu nại mới.",
            followUp: ""
          },
          {
            text: "Nói rằng quán đã ưu ái làm lại nên mong khách thông cảm.",
            replySpeaker: "Khách",
            reply: "“Thôi được rồi, chị về.”",
            effect: { safety: 0, trust: -21, flow: 3, budget: 1 },
            reason: "Cách nói khiến việc khắc phục lỗi thành một món nợ ân tình mà khách phải nhận.",
            followUp: ""
          }
        ]
      }
    ]
  },
  {
    id: "mat-dien", number: "03", title: "Mất điện lúc đang xay đá", place: "Khu pha chế", weather: "Trưa nóng",
    description: "Máy xay tắt, tủ lạnh im. Một đơn đã thanh toán và bốn đơn khác đang chờ.",
    lesson: "Ngừng thiết bị an toàn, kiểm tra nguyên liệu nhạy nhiệt và giao tiếp theo khả năng phục vụ thực tế.",
    beats: [
      {
        time: "12:05", speaker: "Người dẫn chuyện",
        line: "Đèn vụt tắt. Máy xay ngừng giữa chừng, tiếng tủ lạnh cũng im. Ngoài sân vẫn có khách.",
        question: "Bạn xử lý bước đầu thế nào?",
        choices: [
          {
            text: "Dừng thiết bị, tránh thao tác điện không an toàn, giữ cửa tủ lạnh đóng và kiểm tra nguồn điện phù hợp.",
            replySpeaker: "Người cùng ca",
            reply: "“Em sẽ ghi các đơn còn mở. Mình đừng mở tủ liên tục nhé.”",
            effect: { safety: 23, trust: 5, flow: -9, budget: 5 },
            reason: "Giữ an toàn điện và hạn chế tăng nhiệt trong tủ là việc cần làm trước khi cố chạy lại máy.",
            followUp: "Thiết bị được để ở trạng thái an toàn. Nguyên liệu lạnh vẫn đang được bảo vệ."
          },
          {
            text: "Mở tủ kiểm tra hết nguyên liệu rồi thử bật máy nhiều lần.",
            replySpeaker: "Người cùng ca",
            reply: "“Nguồn còn chập chờn, mình đừng thử mãi như vậy.”",
            effect: { safety: -25, trust: -1, flow: -7, budget: -14 },
            reason: "Thao tác điện khi nguồn chưa rõ và mở tủ liên tục tạo thêm rủi ro.",
            followUp: "Nhiệt độ tủ có nguy cơ tăng nhanh hơn, còn nguyên nhân mất điện vẫn chưa rõ."
          },
          {
            text: "Tiếp tục nhận đơn bình thường, hy vọng điện sớm có.",
            replySpeaker: "Khách vừa gọi món",
            reply: "“Vậy nước của em có làm được thật không?”",
            effect: { safety: -5, trust: -14, flow: -18, budget: 0 },
            reason: "Nhận đơn khi chưa biết khả năng phục vụ có thể khiến hoàn tiền và chờ đợi kéo dài.",
            followUp: "Thêm đơn mới đã vào hàng chờ dù các máy vẫn chưa hoạt động."
          }
        ]
      },
      {
        time: "12:12", speaker: "Khách đã thanh toán",
        line: "“Em trả tiền rồi. Nếu không làm được thì cho em biết để em đi.”",
        question: "Bạn đề xuất phương án nào?",
        choices: [
          {
            text: "Nói rõ món đang bị gián đoạn, đề nghị đổi món làm an toàn được hoặc hoàn tiền.",
            replySpeaker: "Khách",
            reply: "“Thôi cho em hoàn tiền. Cảm ơn đã báo sớm.”",
            effect: { safety: 8, trust: 20, flow: 6, budget: -8 },
            reason: "Khách được quyền chọn dựa trên thực tế, không phải dựa vào dự đoán khi nào điện có lại.",
            followUp: "Các đơn không thể làm đã được thống nhất cách xử lý với khách."
          },
          {
            text: "Hứa chắc 5 phút nữa có điện và nhờ khách chờ.",
            replySpeaker: "Khách",
            reply: "“Nếu 5 phút nữa chưa có thì sao?”",
            effect: { safety: 0, trust: -20, flow: -10, budget: 1 },
            reason: "Không thể hứa thời điểm khôi phục khi không có thông tin xác nhận.",
            followUp: "Lời hẹn 5 phút đã đặt quán vào thế khó."
          },
          {
            text: "Tự ý đổi sang nước khác rồi đưa khách, không hỏi trước.",
            replySpeaker: "Khách",
            reply: "“Nhưng em không uống món này. Sao không hỏi em?”",
            effect: { safety: 0, trust: -15, flow: 0, budget: -7 },
            reason: "Một món thay thế chỉ hữu ích khi khách đồng ý.",
            followUp: "Bạn có món thay thế, nhưng không phải món khách đã chọn."
          }
        ]
      },
      {
        time: "12:45", speaker: "Người dẫn chuyện",
        line: "Điện chưa quay lại. Chưa thể xác nhận nhiệt độ bảo quản của một số nguyên liệu dễ hỏng.",
        question: "Bạn quyết định thế nào?",
        choices: [
          {
            text: "Ghi nhận thời gian mất điện, kiểm tra điều kiện bảo quản; loại bỏ nguyên liệu không thể xác nhận an toàn.",
            replySpeaker: "Người cùng ca",
            reply: "“Tốn nguyên liệu thật, nhưng mình không nên đánh cược với sức khỏe khách.”",
            effect: { safety: 27, trust: 14, flow: -6, budget: -21 },
            reason: "Đồ dễ hỏng không đủ căn cứ an toàn không nên tiếp tục dùng chỉ để tiết kiệm.",
            followUp: ""
          },
          {
            text: "Giữ tất cả vì ngửi thấy vẫn bình thường.",
            replySpeaker: "Người cùng ca",
            reply: "“Mùi không cho mình biết chắc đồ còn an toàn đâu.”",
            effect: { safety: -37, trust: -18, flow: 4, budget: 16 },
            reason: "Mùi vị không phải phép kiểm tra đáng tin cậy cho an toàn thực phẩm.",
            followUp: ""
          },
          {
            text: "Vứt toàn bộ nguyên liệu ngay, kể cả phần vẫn bảo quản được và không bị ảnh hưởng.",
            replySpeaker: "Người cùng ca",
            reply: "“Mình nên phân loại dựa vào điều kiện bảo quản thực tế trước đã.”",
            effect: { safety: 12, trust: 2, flow: -15, budget: -29 },
            reason: "Cẩn trọng vẫn cần dựa trên thông tin và quy trình, tránh thiệt hại không cần thiết.",
            followUp: ""
          }
        ]
      }
    ]
  },
  {
    id: "tre-nho", number: "04", title: "Tiếng khóc ở góc bàn", place: "Khu vực khách ngồi", weather: "Chiều cuối tuần",
    description: "Một bé va vào cạnh bàn rồi khóc. Phụ huynh vội chạy tới, cả quán nhìn theo.",
    lesson: "Ưu tiên sức khỏe, hỗ trợ người chăm sóc, xử lý nguy cơ tại chỗ và theo dõi đúng mức độ nghiêm trọng.",
    beats: [
      {
        time: "16:10", speaker: "Người dẫn chuyện",
        line: "Một bé đang đi cạnh bàn thì va vào góc cạnh. Bé bật khóc, phụ huynh chạy lại. Bạn đứng gần nhất.",
        question: "Bạn làm gì đầu tiên?",
        choices: [
          {
            text: "Dừng việc đang làm, giữ khu vực an toàn, hỏi phụ huynh và quan sát dấu hiệu cần hỗ trợ y tế khẩn.",
            replySpeaker: "Phụ huynh",
            reply: "“Anh giúp em dọn lối này, để em xem bé thế nào đã.”",
            effect: { safety: 23, trust: 18, flow: -10, budget: -3 },
            reason: "Ưu tiên bé, không tự ý can thiệp quá mức và sẵn sàng gọi hỗ trợ y tế khi có dấu hiệu nghiêm trọng.",
            followUp: "Phụ huynh đang ở cạnh bé. Bạn đã nhờ người khác hỗ trợ phần quầy."
          },
          {
            text: "Bế bé lên ngay, tách khỏi phụ huynh để dỗ.",
            replySpeaker: "Phụ huynh",
            reply: "“Để em bế con, anh ơi!”",
            effect: { safety: -15, trust: -20, flow: -5, budget: 0 },
            reason: "Không nên tự ý di chuyển hoặc bế trẻ khi chưa rõ tình trạng và chưa có sự đồng ý.",
            followUp: "Phụ huynh phải giành lại việc chăm sóc bé và đang rất căng thẳng."
          },
          {
            text: "Tiếp tục pha nước vì nghĩ trẻ con khóc rồi sẽ nín.",
            replySpeaker: "Một khách khác",
            reply: "“Quán không ai ra xem bé thế nào à?”",
            effect: { safety: -29, trust: -26, flow: 4, budget: 0 },
            reason: "Bỏ qua nguy cơ chấn thương là không phù hợp, dù quán đang đông.",
            followUp: "Khách xung quanh bắt đầu mất niềm tin vì quán chưa có hành động hỗ trợ."
          }
        ]
      },
      {
        time: "16:14", speaker: "Phụ huynh",
        line: "“Bàn này sao góc nhọn thế? Quán có ai phụ em không?” Bé vẫn đang khóc.",
        question: "Bạn phản hồi ra sao?",
        choices: [
          {
            text: "Nhận trách nhiệm kiểm tra khu vực, hỗ trợ theo yêu cầu và đề nghị hỗ trợ y tế khi có dấu hiệu đáng lo.",
            replySpeaker: "Phụ huynh",
            reply: "“Giờ mình ưu tiên xem bé trước. Chuyện cái bàn nói sau.”",
            effect: { safety: 18, trust: 17, flow: -6, budget: -5 },
            reason: "Tập trung vào sức khỏe trước, không tranh cãi và không đưa ra chẩn đoán.",
            followUp: "Phụ huynh được hỗ trợ; bạn đã đưa bàn đó tạm ngưng sử dụng."
          },
          {
            text: "Giải thích phụ huynh phải tự trông bé nên quán không có lỗi.",
            replySpeaker: "Phụ huynh",
            reply: "“Em đang hỏi nhờ anh giúp, chưa nói chuyện ai có lỗi.”",
            effect: { safety: -12, trust: -28, flow: 1, budget: 2 },
            reason: "Đổ lỗi lúc người nhà đang lo cho trẻ dễ làm căng thẳng hơn và trì hoãn hỗ trợ.",
            followUp: "Không khí tại khu bàn trở nên căng thẳng; chiếc bàn vẫn cần được kiểm tra."
          },
          {
            text: "Đưa đồ uống miễn phí, mong cả nhà bình tĩnh lại.",
            replySpeaker: "Phụ huynh",
            reply: "“Em không cần nước. Anh giúp em dọn chỗ này trước.”",
            effect: { safety: -9, trust: -7, flow: -3, budget: -12 },
            reason: "Đồ uống miễn phí không thay cho hành động hỗ trợ an toàn.",
            followUp: "Phụ huynh vẫn cần được hỗ trợ thực tế và khu vực chưa được xử lý rõ ràng."
          }
        ]
      },
      {
        time: "16:25", speaker: "Người dẫn chuyện",
        line: "Tình huống đã bớt hỗn loạn. Chiếc bàn và lối đi vừa xảy ra va chạm vẫn còn trong khu khách.",
        question: "Bạn làm gì để hạn chế tái diễn?",
        choices: [
          {
            text: "Tạm ngưng dùng bàn, kiểm tra góc cạnh và bố trí lại lối đi; ghi nhận sự cố tối thiểu, bảo mật thông tin.",
            replySpeaker: "Người cùng ca",
            reply: "“Để em kiểm tra các góc bàn còn lại trước khi đón thêm khách.”",
            effect: { safety: 23, trust: 12, flow: -6, budget: -8 },
            reason: "Khắc phục nguyên nhân, ghi nhận sự kiện phù hợp và bảo vệ riêng tư tốt hơn một lời hứa chung chung.",
            followUp: ""
          },
          {
            text: "Cho khách khác ngồi ngay vì chuyện đã qua.",
            replySpeaker: "Một vị khách",
            reply: "“Bàn này vừa có bé bị va vào đúng không?”",
            effect: { safety: -24, trust: -17, flow: 8, budget: 1 },
            reason: "Một vị trí có nguy cơ cần được kiểm tra trước khi đưa trở lại sử dụng.",
            followUp: ""
          },
          {
            text: "Đăng hình và kể sự cố lên mạng để giải thích quán không cố ý.",
            replySpeaker: "Người cùng ca",
            reply: "“Chuyện của bé là riêng tư mà. Mình đừng đăng hình khi chưa được đồng ý.”",
            effect: { safety: -7, trust: -31, flow: -8, budget: 0 },
            reason: "Thông tin và hình ảnh liên quan trẻ em cần được bảo vệ; đăng công khai không phải cách xử lý sự cố.",
            followUp: ""
          }
        ]
      }
    ]
  }
];

export const clamp = (value) => Math.max(0, Math.min(100, value));

export function applyEffects(current, effect) {
  const next = { ...current };
  for (const { key } of DIMENSIONS) next[key] = clamp((current[key] ?? 0) + (effect[key] ?? 0));
  return next;
}

export function getEnding(stats, scenario) {
  const caution = stats.safety < 58;
  const lowTrust = stats.trust < 48;
  const slow = stats.flow < 42;
  if (caution) return {
    headline: "Quán vẫn mở, nhưng còn nguy cơ cần xử lý",
    summary: "Bạn đã đi hết tình huống. Một số quyết định tạo rủi ro an toàn. Trong ca thật, nên ưu tiên cô lập nguy cơ và gọi hỗ trợ phù hợp trước khi tiếp tục phục vụ."
  };
  if (lowTrust) return {
    headline: "Giải quyết xong việc, chưa chắc đã giữ được khách",
    summary: "Vận hành là một phần; lời nói rõ ràng và trách nhiệm với khách cũng quyết định họ có muốn quay lại hay không."
  };
  if (slow) return {
    headline: "Cả ca an toàn, nhưng quầy khá quá tải",
    summary: "Bạn đã chú ý an toàn và giao tiếp. Bước tiếp theo là phân vai, sắp thứ tự và kiểm soát khối lượng đơn."
  };
  return {
    headline: "Ca này đã được giữ trong tầm kiểm soát",
    summary: "Không phải quyết định nào cũng ít tốn kém, nhưng bạn đã duy trì được những ưu tiên quan trọng để quán hoạt động bền vững."
  };
}

export function validateStory(scenarios = SCENARIOS) {
  const ids = new Set();
  for (const scenario of scenarios) {
    if (!scenario.id || ids.has(scenario.id)) throw new Error("Scenario ID trùng hoặc thiếu");
    ids.add(scenario.id);
    if (scenario.beats.length !== 3) throw new Error("Mỗi tình huống cần ba hồi: " + scenario.id);
    for (const beat of scenario.beats) {
      if (beat.choices.length !== 3) throw new Error("Mỗi hồi cần ba lựa chọn: " + scenario.id);
      for (const choice of beat.choices) {
        if (!choice.text || !choice.reply || !choice.reason || !choice.effect) {
          throw new Error("Thiếu nội dung phản hồi: " + scenario.id);
        }
        for (const key of Object.keys(choice.effect)) {
          if (!DIMENSIONS.some((metric) => metric.key === key)) throw new Error("Chỉ số lạ: " + key);
        }
      }
    }
  }
  return true;
}
