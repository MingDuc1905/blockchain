import os
import subprocess
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

OUTPUT_PDF = r"C:\Users\MingDuc\Downloads\Quyen_Rieng_Tu_Hay_Minh_Bach_Ban_Dich_Tieng_Viet.pdf"
TEMP_HTML = os.path.join(os.environ.get("TEMP", r"C:\Users\MingDuc\AppData\Local\Temp"), "translated_paper.html")
EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

html_content = """<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title>Quyền riêng tư hay Tính minh bạch? Quyền truy cập điện thoại thông minh được thương lượng như một biểu trưng của lòng tin trong các mối quan hệ tình cảm</title>
<style>
  @page {
    size: A4;
    margin: 20mm 18mm 20mm 18mm;
    @bottom-center {
      content: counter(page);
      font-size: 10pt;
      font-family: 'Times New Roman', serif;
    }
  }
  body {
    font-family: 'Times New Roman', 'Segoe UI', serif;
    font-size: 11pt;
    line-height: 1.45;
    color: #111;
    background: #fff;
    text-align: justify;
    margin: 0;
    padding: 0;
  }
  .header-block {
    text-align: center;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 1.5px solid #222;
  }
  .paper-badge {
    font-size: 9.5pt;
    font-weight: bold;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }
  h1.title-vn {
    font-size: 17pt;
    font-weight: bold;
    line-height: 1.3;
    margin: 10px 0 6px 0;
    color: #0d1b2a;
  }
  .title-en {
    font-size: 11pt;
    font-style: italic;
    color: #444;
    margin-bottom: 16px;
  }
  .authors-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px 30px;
    margin: 15px 0;
    font-size: 10pt;
  }
  .author-card {
    text-align: center;
  }
  .author-name {
    font-weight: bold;
    color: #1b263b;
  }
  .author-affil {
    color: #555;
    font-size: 9pt;
  }
  .abstract-box {
    background-color: #f8f9fa;
    border: 1px solid #dcdcdc;
    border-left: 4px solid #1b263b;
    padding: 12px 16px;
    margin: 20px 0;
    font-size: 10pt;
    line-height: 1.45;
  }
  .abstract-title {
    font-weight: bold;
    text-transform: uppercase;
    font-size: 10pt;
    margin-bottom: 6px;
    color: #0d1b2a;
    display: inline-block;
  }
  h2.sec-heading {
    font-size: 13pt;
    font-weight: bold;
    color: #0d1b2a;
    border-bottom: 1px solid #ccc;
    padding-bottom: 3px;
    margin-top: 24px;
    margin-bottom: 8px;
    text-transform: uppercase;
  }
  h3.subsec-heading {
    font-size: 11.5pt;
    font-weight: bold;
    color: #1b263b;
    margin-top: 16px;
    margin-bottom: 6px;
  }
  h4.subsubsec-heading {
    font-size: 10.5pt;
    font-weight: bold;
    font-style: italic;
    color: #333;
    margin-top: 12px;
    margin-bottom: 4px;
  }
  p {
    margin: 0 0 8px 0;
    text-indent: 1.2em;
  }
  p.no-indent {
    text-indent: 0;
  }
  .quote-box {
    margin: 10px 20px;
    padding: 8px 14px;
    background: #f4f6f8;
    border-left: 3px solid #415a77;
    font-style: italic;
    font-size: 10pt;
  }
  .quote-author {
    display: block;
    text-align: right;
    font-style: normal;
    font-weight: bold;
    font-size: 9pt;
    color: #555;
    margin-top: 4px;
  }
  table.data-table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 9pt;
  }
  table.data-table th, table.data-table td {
    border: 1px solid #777;
    padding: 5px 7px;
    text-align: center;
  }
  table.data-table th {
    background-color: #e9ecef;
    font-weight: bold;
    color: #111;
  }
  table.data-table tr:nth-child(even) {
    background-color: #fbfbfb;
  }
  .table-title {
    font-weight: bold;
    font-size: 9.5pt;
    margin-top: 10px;
    margin-bottom: 4px;
    text-align: left;
  }
  .table-notes {
    font-size: 8pt;
    font-style: italic;
    color: #555;
    margin-top: 4px;
    margin-bottom: 12px;
    text-align: left;
  }
  .key-finding {
    background: #eef4f8;
    border-left: 3px solid #1d3557;
    padding: 8px 12px;
    margin: 10px 0;
    font-size: 10pt;
  }
  .ref-list {
    font-size: 8.5pt;
    line-height: 1.35;
    padding-left: 20px;
  }
  .ref-item {
    margin-bottom: 5px;
    text-indent: -1.5em;
    padding-left: 1.5em;
  }
  .page-break {
    page-break-before: always;
  }
  .stat-highlight {
    font-weight: bold;
    color: #0b2545;
  }
</style>
</head>
<body>

<div class="header-block">
  <div class="paper-badge">Bản Dịch Tiếng Việt Chuẩn Học Thuật &bull; Xuất Bản Tại arXiv:2407.04906v1 [cs.CR] 6 Jul 2024</div>
  <h1 class="title-vn">Quyền Riêng Tư Hay Tính Minh Bạch?<br>Quyền Truy Cập Điện Thoại Thông Minh Được Thương Lượng Như Một Biểu Trưng Của Lòng Tin Trong Các Mối Quan Hệ Tình Cảm</h1>
  <div class="title-en">Privacy or Transparency? Negotiated Smartphone Access as a Signifier of Trust in Romantic Relationships</div>
  
  <div class="authors-grid">
    <div class="author-card">
      <div class="author-name">Periwinkle Doerfler</div>
      <div class="author-affil">Đại học New York (New York University)</div>
    </div>
    <div class="author-card">
      <div class="author-name">Kieron Ivy Turk</div>
      <div class="author-affil">Đại học Cambridge &amp; Đại học New York</div>
    </div>
    <div class="author-card">
      <div class="author-name">Chris Geeng</div>
      <div class="author-affil">Đại học New York</div>
    </div>
    <div class="author-card">
      <div class="author-name">Damon McCoy</div>
      <div class="author-affil">Đại học New York</div>
    </div>
    <div class="author-card">
      <div class="author-name">Jeffrey Ackerman</div>
      <div class="author-affil">Đại học Griffith (Griffith University)</div>
    </div>
    <div class="author-card">
      <div class="author-name">Molly Dragiewicz</div>
      <div class="author-affil">Đại học Griffith</div>
    </div>
  </div>
</div>

<div class="abstract-box">
  <span class="abstract-title">Tóm Tắt Nghiên Cứu (Abstract)</span><br>
  Trong công trình này, chúng tôi phân tích hai cuộc khảo sát quy mô lớn để tìm hiểu cách các cá nhân nhận thức về việc chia sẻ quyền truy cập điện thoại thông minh với bạn đời / người yêu như một hàm số của lòng tin trong mối quan hệ. Chúng tôi phát hiện ra rằng phần lớn các cặp đôi có quyền truy cập vào thiết bị của nhau, nhưng có thể tồn tại những ranh giới rõ ràng (tường minh) hoặc ngầm định về cách thức sử dụng quyền truy cập này. Khi đi sâu khảo sát các ranh giới này và các chuẩn mực xã hội liên quan, chúng tôi nhận thấy có rất ít sự đồng thuận về mức độ truy cập điện thoại (tức tính minh bạch) hoặc việc không truy cập (tức quyền riêng tư) được coi là mong muốn trong bối cảnh tình cảm lãng mạn. Tuy nhiên, có sự đồng thuận rộng rãi rằng mức độ truy cập phải mang tính hai chiều (tương hỗ) và dựa trên sự đồng thuận của cả hai bên. Đa số các cá nhân đều xem lòng tin là nền tảng cho các quyết định của họ về tính minh bạch và sự riêng tư. Hơn nữa, chúng tôi ghi nhận việc các cá nhân từng vượt qua những ranh giới này, xâm phạm quyền riêng tư của đối phương và phản bội lòng tin của họ. Chúng tôi xem xét cách thức, thời điểm, nguyên do và đối tượng thực hiện các hành vi phản bội này. Chúng tôi cũng cân nhắc những hệ lụy của việc vi phạm ranh giới trong trường hợp bạo lực giữa các đối tác thân mật (Intimate Partner Violence - IPV). Cuối cùng, chúng tôi đề xuất một tập hợp các khuyến nghị thay đổi thiết kế hệ điều hành và ứng dụng di động nhằm hỗ trợ thực thi bằng công nghệ đối với các ranh giới vốn hiện chỉ được duy trì bằng niềm tin, qua đó đưa cơ chế kiểm soát quyền truy cập phù hợp với sở thích chia sẻ thực tế của người dùng.
</div>

<h2 class="sec-heading">1. Mở Đầu (Introduction)</h2>
<p>
Hiện nay, 85% người trưởng thành tại Hoa Kỳ sở hữu điện thoại thông minh, và ngày càng có nhiều người hoàn toàn phụ thuộc vào chúng để truy cập Internet [13]. Tuy nhiên, thiết kế kiểm soát truy cập trên điện thoại chủ yếu tồn tại ở dạng nhị phân (binary): một người hoặc là có quyền truy cập, hoặc là hoàn toàn không có quyền. Nếu một người được cấp quyền truy cập vào thiết bị vì các mục đích vô hại như tra cứu đường đi hoặc chơi trò chơi, họ cũng đồng thời có khả năng đọc các tin nhắn riêng tư, truy cập mạng xã hội, kiểm tra lịch sử tìm kiếm web và nhiều thông tin nhạy cảm khác. Có rất nhiều hoàn cảnh thực tế mà việc chia sẻ quyền truy cập là cần thiết, tiện lợi hoặc đáng mong muốn, thế nhưng lại có rất ít công cụ hỗ trợ cho phép những người tin tưởng lẫn nhau có thể thiết lập các tùy chọn chia sẻ, bảo mật và quyền riêng tư lý tưởng trên điện thoại thông minh [74].
</p>
<p>
Thực tế này làm dấy lên sự căng thẳng sâu sắc giữa quyền riêng tư và tính minh bạch trong các mối quan hệ dựa trên sự tin cậy. Liệu một người có tin tưởng đối tác của mình đến mức trao cho họ quyền truy cập thiết bị không hạn chế (tức là đem lại tính minh bạch tuyệt đối), hay đối tác tin tưởng bản thân người đó đến mức chủ động từ bỏ hoàn toàn quyền truy cập vào thiết bị của đối phương (tức là ưu tiên tôn trọng quyền riêng tư)?
</p>
<p>
Các nhà nghiên cứu trước đây đã chỉ ra rằng các gia đình và cặp đôi thường xuyên chia sẻ thiết bị và thông tin xác thực với nhau [37, 38, 43, 48, 51]. Các nghiên cứu tâm lý xã hội đã xem xét kỳ vọng của các cặp đôi về việc sử dụng điện thoại để giao tiếp với nhau [10, 24], cũng như việc giao tiếp với những người quen khác giới [24, 35]. Tuy nhiên, có rất ít nghiên cứu điều tra sâu về kỳ vọng của các cặp đôi xoay quanh việc sử dụng thiết bị của nhau. Các nhà khoa học cũng từng nghiên cứu mối quan hệ giữa lòng tin và các hành vi "xem lén" (snooping) giữa các cặp đôi [7, 25, 27, 63, 66], cũng như mức độ phổ biến của việc giám sát đối tác thân mật [35, 54]. Mặc dù vậy, phần lớn các công trình này thường mặc định rằng các hành vi chia sẻ nhập nhằng là tiêu cực mà không khám phá thấu đáo bối cảnh xảy ra, ý nghĩa thực sự của hành vi hoặc tác động của chúng đối với những người trong cuộc [11].
</p>
<p>
Để điều tra sâu sắc hành vi chia sẻ thiết bị của các cặp đôi trong mối quan hệ, chúng tôi trình bày các phát hiện từ hai cuộc khảo sát: cuộc khảo sát thứ nhất do nhóm tác giả trực tiếp thực hiện nhằm (1) đo lường mức độ truy cập của người tham gia vào thiết bị của bạn đời và (2) đánh giá nhận thức về việc sử dụng mang tính chuẩn mực và chấp nhận được của quyền truy cập đó; cuộc khảo sát thứ hai do tập đoàn bảo mật Norton tiến hành nhằm (3) đo lường các hành vi truy cập không có sự đồng thuận vào thiết bị của đối tác.
</p>

<div class="key-finding">
  <strong>Ba phát hiện cốt lõi của nghiên cứu:</strong>
  <ol style="margin: 5px 0 0 15px; padding: 0;">
    <li><strong>Rất ít sự đồng thuận về hành vi chia sẻ chuẩn mực:</strong> Mọi hành vi mà chúng tôi đo lường đều có cả những người ủng hộ mạnh mẽ lẫn những người chỉ trích quyết liệt, và động cơ hầu như luôn bắt nguồn từ thước đo lòng tin.</li>
    <li><strong>Đa số đồng ý rằng quyền truy cập phải có tính thương lượng, tương hỗ và đồng thuận:</strong> Việc truy cập và sử dụng phải dựa trên sự đồng thuận của cả hai bên và có tính bình đẳng hai chiều.</li>
    <li><strong>Biện minh chủ yếu cho việc truy cập không đồng thuận là lo ngại ngoại tình:</strong> Dù vậy, chúng tôi lưu ý rằng ranh giới giữa việc truy cập không đồng thuận "có thể biện minh được / vô hại" và hành vi lạm dụng, bạo hành là rất mong manh [9].</li>
  </ol>
</div>

<p>
Cuối cùng, chúng tôi đề xuất một bộ khuyến nghị thay đổi thiết kế trên hệ điều hành di động và các ứng dụng nhằm cho phép kiểm soát quyền truy cập chi tiết (granular access control), xóa bỏ sự ràng buộc cứng nhắc của cơ chế nhị phân và biến các ranh giới được thương lượng giữa hai người trở thành hiện thực có thể thực thi được bằng công nghệ.
</p>

<h2 class="sec-heading">2. Các Công Trình Liên Quan (Related Work)</h2>

<h3 class="subsec-heading">2.1 Chia Sẻ Trong Các Mối Quan Hệ Thân Mật (Sharing in Intimate Relationships)</h3>
<p>
Các nhà nghiên cứu đã khám phá cách các gia đình và những người có quan hệ gần gũi suy nghĩ cũng như thực hành việc chia sẻ thiết bị và thông tin xác thực [37, 48]. Mặc dù thói quen này rất phổ biến giữa những người tin tưởng nhau [48], nhưng trong các cặp đôi, nó có thể dẫn đến những lo ngại ngoài ý muốn về quyền riêng tư [38]. Các lý do chính dẫn đến việc chia sẻ tài khoản trong các cặp đôi lãng mạn bao gồm "duy trì mối quan hệ, lòng tin và sự thuận tiện" [51], cũng như các chuẩn mực liên quan đến công việc hoặc quy ước riêng của cặp đôi [42]. Các cặp đôi sống cùng nhau trong ngôi nhà thông minh (smart home) cũng phải xử lý việc chia sẻ quyền truy cập thiết bị thông minh [31, 75]. Bất chấp việc chia sẻ thiết bị và thông tin xác thực là phổ biến, Wu và các cộng sự nhận thấy có rất ít công cụ cho phép các đối tác thân mật duy trì đồng thời cả hành vi xã hội lẫn hành vi bảo mật lý tưởng của họ trong bối cảnh này [74].
</p>
<p>
Trong khi phần lớn các tài liệu bảo mật máy tính về chia sẻ mật khẩu đều cho rằng hành vi này nên bị ngăn cấm hoặc ngăn chặn [26, 44], các nghiên cứu gần đây lại phát hiện ra những trường hợp mà tính bảo mật và quyền riêng tư kỹ thuật số được quản lý theo phương thức hợp tác [34]. Kaye đã nghiên cứu một nhóm nhỏ cá nhân để tìm hiểu việc chia sẻ mật khẩu trên diện rộng trên các ứng dụng, và nhận thấy rằng hành vi này vừa phổ biến vừa được cân nhắc kỹ lưỡng [40]. Singh và các cộng sự khi nghiên cứu về việc chia sẻ mật khẩu ngân hàng cũng chỉ ra rằng việc chia sẻ là phổ biến, tiện lợi đối với các cặp đôi và đôi khi là hoàn toàn không thể tránh khỏi đối với những người khuyết tật [60]. Sự chia sẻ trong các cặp đôi này cũng áp dụng cho các tài khoản khác, thông qua mật khẩu, dùng chung tài khoản, hoặc đơn giản là để thiết bị ở trạng thái mở khóa [38].
</p>

<h3 class="subsec-heading">2.2 Quyền Riêng Tư và Lòng Tin Trong Bối Cảnh Thân Mật (Privacy and Trust in Intimate Contexts)</h3>
<p>
Nghiên cứu về việc chia sẻ thiết bị và thông tin xác thực bắt đầu chạm đến vấn đề quyền riêng tư trong các bối cảnh thân mật. Trong tâm lý học, Thuyết Quản trị Quyền riêng tư Truyền thông (Communication-Privacy Management - CPM) khám phá việc thiết lập các ranh giới riêng tư chung trong gia đình, nơi nhiều người cùng phối hợp quản lý thông tin cá nhân [52]. Đặc biệt trong các mối quan hệ tình cảm lãng mạn, Thuyết Biện chứng Giữa Kết nối và Tự chủ (Connection-Autonomy Dialectic) giải thích sự căng thẳng giằng co giữa tính thân mật gắn kết và sự tự do độc lập. Duran và các cộng sự đã áp dụng khung lý thuyết này vào kỳ vọng được thương lượng của các cặp đôi về giao tiếp kỹ thuật số, phát hiện ra rằng một số người chủ động cấp quyền cho đối tác truy cập vào thiết bị của họ nhằm giảm thiểu xung đột và nghi ngờ [24].
</p>
<p>
Trong một nghiên cứu phỏng vấn các cặp vợ chồng dị tính tại Vương quốc Anh, Helsper và cộng sự nhận thấy người chồng và người vợ không phải lúc nào cũng đồng thuận về các chuẩn mực giao tiếp trực tuyến phù hợp với người quen khác giới. Ở những cặp đôi có xảy ra hành vi xem lén, họ nhận thấy cả hai đối tác nhìn chung đều làm việc đó ở mức độ tương đương nhau [35]. Nghiên cứu của Laborde và cộng sự đối với thanh thiếu niên gốc Latinh cho thấy: nhận thức rằng nạn ngoại tình đang diễn ra tràn lan khiến cho việc có quyền truy cập vào điện thoại của đối phương và duy trì mức độ riêng tư kỹ thuật số thấp lại trở thành một phương thức hữu hiệu để gây dựng lòng tin trong mối quan hệ [41].
</p>

<h3 class="subsec-heading">2.3 Giám Sát và Hành Vi Xem Lén (Monitoring and Snooping)</h3>
<p>
Có rất nhiều nghiên cứu xem xét các hành vi kỹ thuật số trong quan hệ tình cảm, mặc dù rất ít nghiên cứu điều tra xem liệu những người trong mối quan hệ có coi hành vi giám sát là điều hiển nhiên hay là có vấn đề. Các nhà nghiên cứu đã tìm thấy một số yếu tố dẫn đến hành vi xem lén thiết bị của đối tác, bao gồm sự thiếu tin tưởng trong mối quan hệ [7], sự tự tin vào năng lực công nghệ để thu thập thông tin mong muốn mà không bị phát hiện [63], và kiểu gắn bó tình cảm (attachment style), dù cho sự bất định trong mối quan hệ không phải là yếu tố gây ảnh hưởng [27].
</p>
<p>
Nghiên cứu về giám sát bạn đời cũng xem xét việc theo dõi các tài khoản mạng xã hội của đối phương mà không cần trực tiếp chạm vào thiết bị của họ [1, 8, 17, 25, 64]. Nhiều nghiên cứu coi việc sử dụng mạng xã hội là nguyên nhân gây ra các rắc rối trong mối quan hệ; tuy nhiên, một số kết quả lại mâu thuẫn nhau. Clayton phát hiện ra rằng thời gian gắn bó của mối quan hệ không ảnh hưởng đến việc liệu việc dùng Twitter có biến thành điểm xung đột hay không [16], trong khi Smith chỉ ra rằng việc sử dụng Facebook chỉ có mối tương quan tiêu cực đối với các mối quan hệ tương đối mới [15].
</p>
<p>
Các nhà nghiên cứu bảo mật cũng đã điều tra những "trường hợp cực đoan" của việc giám sát mối quan hệ bằng phần mềm gián điệp (spyware). Chatterjee và các cộng sự đã xác định hàng trăm ứng dụng có sẵn trên các kho ứng dụng sở hữu khả năng theo dõi lén (stalking capabilities), trong đó một số ứng dụng còn công khai quảng cáo tính năng giám sát bạn đời như một trường hợp sử dụng chính [14]. Bellini và cộng sự thảo luận về các diễn đàn nơi người dùng các phần mềm này tụ họp và cách họ biện minh cho hành vi này [9]. Freed và cộng sự phân tích những khó khăn trong việc khắc phục bạo hành có sự hỗ trợ của công nghệ (bao gồm spyware), cũng như nỗi lo sợ của nạn nhân về phản ứng dữ dội của kẻ bạo hành khi bị mất quyền truy cập [29]. Wei và cộng sự nghiên cứu các dạng lời khuyên "phản an ninh" mà người dùng TikTok chia sẻ để lén lút giám sát bạn đời [67].
</p>

<h3 class="subsec-heading">2.4 Lạm Dụng Công Nghệ Trong Kiểm Soát Cưỡng Chế (Abuse of Technology in Coercive Control)</h3>
<p>
Hiện có một khối lượng nghiên cứu đáng kể về vai trò của công nghệ trong kiểm soát cưỡng chế (Coercive Control — một mô thức hành vi bạo hành bao gồm bạo lực thể xác và phi thể xác, được tạo điều kiện bởi sự bất bình đẳng giới mang tính cấu trúc [62]) [19–22, 62, 69, 70, 72, 73], chứng minh phương tiện truyền thông kỹ thuật số và điện thoại di động đang tiếp tay cho bạo hành. Freed và cộng sự đã mô hình hóa kẻ bạo hành như một "người dùng đối kháng nhưng đã được xác thực" (authenticated but adversarial user); dạng đối kháng này nhấn mạnh sự cần thiết của việc các nhà thiết kế công nghệ phải lường trước các mối đe dọa mang tính tương tác giữa các cá nhân [28].
</p>
<p>
Tính minh bạch và sự riêng tư trên điện thoại thông minh đặt ra những mối lo ngại sâu sắc đối với những người sống sót sau bạo hành. Woodlock chỉ ra rằng 56% phụ nữ có đối tác bạo hành bị kẻ đó dùng công nghệ di động để định vị vị trí, 47% bị kiểm tra tin nhắn mà không được cho phép, và 17% bị ép buộc giao mật khẩu điện tử [71]. Douglas và cộng sự nhận thấy những kẻ bạo hành thường xuyên đòi lục soát điện thoại của phụ nữ [19, 21]. Dragiewicz và cộng sự ghi nhận những kẻ bạo hành còn gây áp lực lên con cái để moi thông tin đăng nhập điện thoại của người mẹ [21–23]. Mặc dù các công trình này cực kỳ quan trọng, chúng chỉ mới ghi nhận sự bạo hành được công nghệ hỗ trợ trong các mối quan hệ vốn đã được nạn nhân nhận diện là bạo hành. Chúng ta cần thêm các nghiên cứu để hiểu rõ phổ liên tục từ việc chia sẻ công nghệ mang tính chuẩn mực cho đến bạo hành nghiêm trọng; nghiên cứu của chúng tôi nhằm lấp đầy khoảng trống này ở phía chuẩn mực của phổ liên tục.
</p>

<h2 class="sec-heading">3. Phương Pháp Nghiên Cứu (Methodology)</h2>

<h3 class="subsec-heading">3.1 Thu Thập Dữ Liệu (Data Collection)</h3>
<p>
Khảo sát của chúng tôi được triển khai từ tháng 11 năm 2020 đến tháng 3 năm 2021 qua hai giai đoạn: giai đoạn 1 tuyển dụng thông qua quảng cáo nhắm mục tiêu trên Facebook; giai đoạn 2 tuyển dụng qua nền tảng nghiên cứu trực tuyến Prolific.
</p>
<p>
<strong>Tuyển dụng qua Facebook:</strong> Chúng tôi chọn tuyển dụng qua quảng cáo Facebook vì nhận thức rằng người dùng trên các nền tảng khảo sát như MTurk và Prolific thường có địa vị kinh tế - xã hội (SES) cao hơn và hiểu biết công nghệ hơn dân số chung [12]. Những yếu tố này có thể ảnh hưởng đến xu hướng chia sẻ thiết bị (do ràng buộc tài chính hoặc cần hỗ trợ kỹ thuật). Do phụ nữ thường chiếm tỷ lệ cao trong các khảo sát trực tuyến [32, 53, 61], chúng tôi chạy các chiến dịch hướng đến nam giới, hạn chế nhắm đến người có thu nhập cao và đôi khi loại trừ người có bằng đại học. Chúng tôi cũng nhắm đến cộng đồng LGBTQ+ thông qua các trang hâm mộ phù hợp để đạt sự đa dạng. Sau một số báo cáo người dùng (dù không vi phạm chính sách của Facebook), tài khoản quảng cáo bị khóa và chúng tôi chuyển sang Prolific. Tổng cộng có 327 người tham gia từ Facebook.
</p>
<p>
<strong>Tuyển dụng qua Prolific:</strong> Chúng tôi tuyển 204 người còn lại qua Prolific theo 2 đợt: một đợt chỉ tuyển nam giới, và một đợt chỉ tuyển những người có thu nhập hộ gia đình dưới 60.000 USD và không có bằng cử nhân, nhằm cân bằng mẫu. Tổng số người tham gia hợp lệ là N = 531.
</p>

<div class="table-title">Bảng 1: Phân bổ các yếu tố nhân khẩu học của mẫu khảo sát qua các kênh tuyển dụng</div>
<table class="data-table">
  <thead>
    <tr>
      <th rowspan="2">Kênh</th>
      <th rowspan="2">N</th>
      <th colspan="3">Giới tính &amp; Xu hướng</th>
      <th colspan="4">Độ tuổi (Nhóm tuổi)</th>
      <th colspan="3">Tình trạng mối quan hệ</th>
    </tr>
    <tr>
      <th>Nữ</th>
      <th>Nam</th>
      <th>LGBTQ+</th>
      <th>18-25 (Gen Z)</th>
      <th>26-40 (Millennial)</th>
      <th>41-59 (Gen X)</th>
      <th>60+ (Boomer)</th>
      <th>Độc thân</th>
      <th>Nghiêm túc</th>
      <th>Khác</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Tổng số</strong></td>
      <td><strong>531</strong></td>
      <td>274</td>
      <td>225</td>
      <td>63</td>
      <td>196</td>
      <td>174</td>
      <td>121</td>
      <td>40</td>
      <td>154</td>
      <td>193</td>
      <td>184</td>
    </tr>
    <tr>
      <td>Facebook</td>
      <td>327</td>
      <td>210</td>
      <td>96</td>
      <td>33</td>
      <td>107</td>
      <td>98</td>
      <td>90</td>
      <td>32</td>
      <td>96</td>
      <td>120</td>
      <td>111</td>
    </tr>
    <tr>
      <td>Prolific</td>
      <td>204</td>
      <td>64</td>
      <td>129</td>
      <td>30</td>
      <td>89</td>
      <td>76</td>
      <td>31</td>
      <td>8</td>
      <td>58</td>
      <td>73</td>
      <td>73</td>
    </tr>
  </tbody>
</table>

<h3 class="subsec-heading">3.2 Thiết Kế Khảo Sát (Survey Design)</h3>
<p>
Khảo sát bao gồm 4 phần chính: 1) Các câu hỏi kỹ thuật (điện thoại có khóa không, khóa bằng cách nào); 2) Câu hỏi về đối tác, thiết bị công nghệ của họ và quyền truy cập của người tham gia; 3) Nhận thức về các hành vi công nghệ trong mối quan hệ lãng mạn; 4) Câu hỏi sàng lọc bạo lực và nhân khẩu học. Những người độc thân không phải trả lời Phần 2 và phần sàng lọc bạo lực ở Phần 4.
</p>
<p>
<strong>Khoản thù lao bồi dưỡng:</strong> Với người dùng Facebook, để không thu thập thông tin nhận dạng cá nhân (PII), chúng tôi tổ chức bốc thăm nhận thẻ quà tặng Amazon 50$ (tỷ lệ 1 trên 25 người trúng, trung bình 2$/người). Với Prolific, người tham gia nhận thù lao cố định 2$ cho việc hoàn thành khảo sát (tương đương mức lương theo giờ cao hơn mức lương tối thiểu tại Mỹ).
</p>
<p>
<strong>Thiết kế câu hỏi:</strong> Phần 3 liệt kê một loạt các hành vi từ "Chia sẻ tài khoản ngân hàng" cho đến "Kiểm tra lịch sử vị trí trên điện thoại đối tác". Đầu tiên, người tham gia đánh giá mức độ phổ biến của hành vi (từ rất hiếm gặp đến rất phổ biến). Sau đó, họ đưa ra phán đoán đạo đức về hành vi đó: tốt/lành mạnh, bình thường, có vấn đề, hay xấu/độc hại. Chúng tôi phân loại mối quan hệ "nghiêm túc" gồm những người đã kết hôn, đính hôn, sống chung như vợ chồng hoặc có quan hệ kết hợp dân sự (14% trong số này thuộc LGBTQ+).
</p>

<h3 class="subsec-heading">3.3 Dữ Liệu Khảo Sát Bổ Trợ Của Norton (Norton Data)</h3>
<p>
Bên cạnh khảo sát trên, chúng tôi tiến hành phân tích bộ dữ liệu bổ trợ của Norton do tổ chức uy tín Harris Poll thực hiện năm 2019 trên 2.050 người Mỹ trưởng thành (1.200 nữ, 850 nam), mang tính đại diện dân số Hoa Kỳ về độ tuổi, học vấn và thu nhập. Khảo sát của Norton tập trung điều tra về các hành vi phi đồng thuận, bao gồm theo dõi trên mạng ("online stalking"), xem lén thiết bị của đối tác, đăng nhập tài khoản trên thiết bị khác và theo dõi qua định vị GPS hoặc ứng dụng chuyên dụng.
</p>

<h2 class="sec-heading">4. Chia Sẻ Và Quyền Truy Cập (Sharing and Access)</h2>

<h3 class="subsec-heading">4.1 Khóa Điện Thoại và Cơ Chế Xác Thực (Locking and Authentication)</h3>
<p>
Phần lớn người tham gia (<span class="stat-highlight">83.7%</span>, N = 552) cho biết điện thoại của họ có cài đặt khóa màn hình. Trong số những người đang có bạn đời, <span class="stat-highlight">84.7%</span> (N = 341) cho biết điện thoại của đối phương có khóa. Mô hình hồi quy logistic (chi tiết tại Bảng 4 ở Phụ lục) chỉ ra sự khác biệt rõ rệt theo giới tính: <span class="stat-highlight">82.1%</span> nữ giới khóa điện thoại so với <span class="stat-highlight">90.4%</span> nam giới (sự khác biệt có ý nghĩa thống kê: &chi;&sup2;(8, 460) = 2.35, p = .019). Việc là Nam giới làm tăng khả năng khóa điện thoại lên <span class="stat-highlight">134%</span> (OR = 2.34, 95% CI [1.17, 4.89]). Tuy nhiên, điều này không phản ánh bản chất giới tính mà phản ánh sự chênh lệch nền tảng về mức độ quen thuộc với công nghệ giữa hai giới trong xã hội [47].
</p>

<h3 class="subsec-heading">4.2 Quyền Truy Cập Của Đối Phương và Tính Tương Hỗ (Partner Access &amp; Mutuality)</h3>
<p>
Trong số những người đang có bạn đời (N = 378), 13.8% không khóa máy (đồng nghĩa với việc đối tác có quyền truy cập ngầm định), và 50.8% cho biết đối tác có quyền truy cập tường minh, độc lập. Về phía điện thoại của đối tác: 14.1% không khóa máy và 51% người tham gia có quyền truy cập độc lập vào máy đối tác.
</p>
<p>
Đáng chú ý, trong số những người mà điện thoại có khóa và đối tác có quyền truy cập, có tới <span class="stat-highlight">95.2%</span> đã cung cấp cho đối tác thông tin xác thực "Yếu tố bạn biết" (Something You Know - SYK), cụ thể là mã PIN hoặc hình vẽ mở khóa (swipe pattern). Chỉ có <span class="stat-highlight">27.3%</span> cấp quyền truy cập sinh trắc học (vân tay/khuôn mặt) cho đối tác, và chỉ 4.8% chỉ cấp duy nhất quyền sinh trắc học.
</p>

<div class="table-title">Bảng 2: Tóm tắt trạng thái đối xứng về quyền truy cập giữa các cặp đôi (N = 314)</div>
<table class="data-table">
  <thead>
    <tr>
      <th rowspan="2" colspan="2">Trạng thái quyền truy cập cặp đôi</th>
      <th colspan="2">Đối tác CÓ quyền vào máy người trả lời</th>
      <th colspan="2">Đối tác KHÔNG CÓ quyền vào máy người trả lời</th>
    </tr>
    <tr>
      <th>N</th>
      <th>Tỷ lệ (%)</th>
      <th>N</th>
      <th>Tỷ lệ (%)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th rowspan="2">Người trả lời có quyền vào máy đối tác</th>
      <th>CÓ (Yes)</th>
      <td><strong>189</strong></td>
      <td><strong>55.4%</strong></td>
      <td>33</td>
      <td>9.7%</td>
    </tr>
    <tr>
      <th>KHÔNG (No)</th>
      <td>39</td>
      <td>11.4%</td>
      <td><strong>80</strong></td>
      <td><strong>23.5%</strong></td>
    </tr>
  </tbody>
</table>

<p>
Kết quả kiểm định nhị thức (binomial test) so sánh với phân phối đồng đều cho thấy p &lt; .0001: <strong>sự đối xứng về quyền truy cập (cả hai cùng có hoặc cả hai cùng không) là chuẩn mực chủ đạo trong các mối quan hệ</strong>. Tổng cộng có tới 78.9% cặp đôi ở trạng thái đối xứng (55.4% cùng có quyền và 23.5% cùng không có quyền).
</p>
<p>
Về xu hướng giới trong các cặp đôi dị tính có sự bất đối xứng (61 cặp): ở 27 cặp thì phụ nữ có quyền (nam không có), và ở 34 cặp thì nam giới có quyền (nữ không có). Sự khác biệt này không có ý nghĩa thống kê (&chi;&sup2;(1, 61) = 1.61, p = .205), củng cố kết luận rằng các mối quan hệ luôn có xu hướng duy trì sự bình đẳng (parity) thay vì mất cân bằng. Tuy nhiên, giữa các cặp đồng tính có sự khác biệt lớn: 82% người trong cặp đôi đồng tính nữ có quyền truy cập hai chiều, so với chỉ 41% ở các cặp đôi đồng tính nam (&chi;&sup2;(3, 44) = 9.73, p = .021).
</p>

<h2 class="sec-heading">5. Chia Sẻ Và Lòng Tin (Sharing and Trust)</h2>

<h3 class="subsec-heading">5.1 Thái Độ Đối Với Các Hành Vi Chia Sẻ</h3>
<p>
Bảng 3 dưới đây cung cấp bức tranh chi tiết về nhận thức của người tham gia về tính phổ biến và tính chấp nhận được về mặt đạo đức đối với 18 hành vi công nghệ và tài chính trong mối quan hệ.
</p>

<div class="table-title">Bảng 3: Nhận thức của người tham gia về tính phổ biến và tính chấp nhận được của các hành vi trong mối quan hệ lãng mạn</div>
<table class="data-table">
  <thead>
    <tr>
      <th>Hành vi cụ thể</th>
      <th>Khá phổ biến / Rất phổ biến</th>
      <th>Tốt / Lành mạnh</th>
      <th>Bình thường</th>
      <th>Xấu / Độc hại hoặc Có vấn đề</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#edf2f7;"><td colspan="5"><strong>Chia sẻ thông tin xác thực &amp; tài khoản:</strong></td></tr>
    <tr>
      <td>Chia sẻ mã PIN điện thoại</td>
      <td>0.589</td>
      <td>0.565<sup>&dagger;</sup></td>
      <td>0.231</td>
      <td>0.204</td>
    </tr>
    <tr>
      <td>Chia sẻ sinh trắc học (vân tay, khuôn mặt)</td>
      <td>0.390<sup>&Dagger;</sup></td>
      <td>0.487<sup>&dagger;&Dagger;</sup></td>
      <td>0.164</td>
      <td>0.349</td>
    </tr>
    <tr>
      <td>Chia sẻ mật khẩu mạng xã hội</td>
      <td>0.377<sup>&Dagger;</sup></td>
      <td>0.414<sup>&dagger;</sup></td>
      <td>0.142</td>
      <td>0.444</td>
    </tr>
    <tr>
      <td>Chia sẻ mật khẩu Email</td>
      <td>0.334<sup>&Dagger;</sup></td>
      <td>0.425<sup>&dagger;</sup></td>
      <td>0.160</td>
      <td>0.415</td>
    </tr>
    <tr>
      <td>Chia sẻ mật khẩu xem phim (Netflix, Disney+)</td>
      <td>0.915<sup>&Dagger;</sup></td>
      <td>0.240</td>
      <td>0.712<sup>&Dagger;</sup></td>
      <td>0.048</td>
    </tr>
    <tr>
      <td>Chia sẻ vị trí liên tục (Ongoing Location)</td>
      <td>0.581</td>
      <td>0.409</td>
      <td>0.172</td>
      <td>0.419</td>
    </tr>
    <tr>
      <td>Chia sẻ tài khoản Đám mây (iCloud, Google Drive)</td>
      <td>0.485<sup>*&Dagger;</sup></td>
      <td>0.462<sup>&dagger;</sup></td>
      <td>0.351</td>
      <td>0.187</td>
    </tr>
    <tr>
      <td>Dùng chung tài khoản ngân hàng</td>
      <td>0.746<sup>&Dagger;</sup></td>
      <td>0.508<sup>&dagger;</sup></td>
      <td>0.345</td>
      <td>0.147</td>
    </tr>
    <tr>
      <td>Dùng chung gói cước điện thoại</td>
      <td>0.856<sup>&Dagger;</sup></td>
      <td>0.352</td>
      <td>0.570<sup>&dagger;</sup></td>
      <td>0.088</td>
    </tr>
    <tr style="background:#edf2f7;"><td colspan="5"><strong>Sử dụng ứng dụng theo dõi:</strong></td></tr>
    <tr>
      <td>Dùng ứng dụng theo dõi vị trí hai chiều (Mutual)</td>
      <td>0.253<sup>&Dagger;</sup></td>
      <td>0.190</td>
      <td>0.073</td>
      <td>0.737<sup>&dagger;&Dagger;</sup></td>
    </tr>
    <tr>
      <td>Cài ứng dụng theo dõi lén một chiều (Non-Mutual)</td>
      <td>0.138<sup>&Dagger;</sup></td>
      <td>0.039</td>
      <td>0.016</td>
      <td><strong>0.945</strong><sup>&Dagger;</sup></td>
    </tr>
    <tr style="background:#edf2f7;"><td colspan="5"><strong>Kiểm tra lén thông tin của đối tác:</strong></td></tr>
    <tr>
      <td>Kiểm tra lịch sử tìm kiếm web</td>
      <td>0.432</td>
      <td>0.132</td>
      <td>0.022</td>
      <td>0.846<sup>&dagger;&Dagger;</sup></td>
    </tr>
    <tr>
      <td>Kiểm tra lịch sử vị trí đã đi qua</td>
      <td>0.342</td>
      <td>0.122</td>
      <td>0.026</td>
      <td>0.852<sup>&dagger;&Dagger;</sup></td>
    </tr>
    <tr>
      <td>Kiểm tra nhật ký cuộc gọi trên máy</td>
      <td>0.395<sup>*&Dagger;</sup></td>
      <td>0.114</td>
      <td>0.030</td>
      <td>0.856<sup>&dagger;&Dagger;</sup></td>
    </tr>
    <tr>
      <td>Kiểm tra nhật ký cuộc gọi qua hóa đơn cước</td>
      <td>0.336<sup>*&Dagger;</sup></td>
      <td>0.150</td>
      <td>0.034</td>
      <td>0.816<sup>&dagger;&Dagger;</sup></td>
    </tr>
    <tr>
      <td>Kiểm tra và đọc tin nhắn SMS</td>
      <td>0.462<sup>*&Dagger;</sup></td>
      <td>0.100</td>
      <td>0.030</td>
      <td>0.870<sup>&Dagger;</sup></td>
    </tr>
    <tr style="background:#edf2f7;"><td colspan="5"><strong>Hành vi đối với Mạng xã hội của đối tác:</strong></td></tr>
    <tr>
      <td>Theo dõi hoạt động MXH từ tài khoản của mình</td>
      <td>0.849<sup>&Dagger;</sup></td>
      <td>0.465<sup>&Dagger;</sup></td>
      <td>0.288</td>
      <td>0.247</td>
    </tr>
    <tr>
      <td>Tự ý đăng nhập vào tài khoản MXH của đối tác</td>
      <td>0.312</td>
      <td>0.162</td>
      <td>0.049</td>
      <td>0.789<sup>&Dagger;</sup></td>
    </tr>
    <tr>
      <td>Đọc lén các tin nhắn riêng (DMs)</td>
      <td>0.309<sup>&Dagger;</sup></td>
      <td>0.079</td>
      <td>0.037</td>
      <td>0.884<sup>&dagger;&Dagger;</sup></td>
    </tr>
    <tr>
      <td>Tự ý đăng bài hoặc chỉnh sửa trang MXH đối tác</td>
      <td>0.188<sup>&Dagger;</sup></td>
      <td>0.067</td>
      <td>0.018</td>
      <td>0.915<sup>&dagger;&Dagger;</sup></td>
    </tr>
    <tr>
      <td>Đối chất với đối tác về hoạt động trên MXH</td>
      <td>0.708<sup>*</sup></td>
      <td>0.360</td>
      <td>0.100</td>
      <td>0.540<sup>*&Dagger;</sup></td>
    </tr>
  </tbody>
</table>
<div class="table-notes">
  * Khác biệt có ý nghĩa thống kê giữa Nam và Nữ (&alpha; = 0.05, hiệu chỉnh Benjamini-Hochberg).<br>
  &dagger; Khác biệt có ý nghĩa thống kê theo Tình trạng mối quan hệ (&alpha; = 0.05, hiệu chỉnh Benjamini-Hochberg).<br>
  &Dagger; Khác biệt có ý nghĩa thống kê giữa các Thế hệ (&alpha; = 0.05, hiệu chỉnh Benjamini-Hochberg).
</div>

<p>
<strong>Các hành vi được coi là bình thường và lành mạnh (&ge;80% chấp thuận):</strong> Chia sẻ mật khẩu dịch vụ xem phim trực tuyến (95.2%), dùng chung gói cước điện thoại (92.2%), chia sẻ tài khoản ngân hàng (85.3%), dùng chung tài khoản đám mây (81.3%) và chia sẻ mã PIN điện thoại (79.6%).
</p>
<p>
<strong>Các hành vi bị lên án kịch liệt:</strong> Hành vi bị phản đối dữ dội nhất là "Cài đặt ứng dụng theo dõi lén một chiều" (94.5% đánh giá là độc hại/có vấn đề). Các hành vi xem lén chủ động như đọc trộm tin nhắn SMS (87%), đọc tin nhắn riêng DM (88.4%), kiểm tra lịch sử vị trí (85.2%), lịch sử cuộc gọi (85.6%) và lịch sử tìm kiếm (84.6%) đều bị hơn 80% người tham gia coi là độc hại và không thể chấp nhận.
</p>

<div class="quote-box">
  "Tôi không coi việc xem trang cá nhân mạng xã hội công khai của người yêu là xấu hay độc hại. Nhưng tôi nghĩ mối quan hệ đang chuyển biến xấu đi một khi bạn phải tự đăng nhập vào tài khoản của anh ấy để lén đọc tin nhắn."
  <span class="quote-author">&mdash; Nữ, 33 tuổi, Quan hệ nghiêm túc</span>
</div>

<h3 class="subsec-heading">5.2 Quyền Truy Cập, Ranh Giới Và Sự Đồng Thuận</h3>
<p>
Các phản hồi mở cho thấy bối cảnh đóng vai trò quyết định đối với ý nghĩa của hành vi công nghệ. Nhiều người bộc bạch rằng họ tin tưởng bạn đời tuyệt đối nên không cần và không muốn kiểm tra điện thoại:
</p>
<div class="quote-box">
  "Vợ chồng tôi dành cho nhau sự tin tưởng rất lớn. Tôi hoàn toàn không bận tâm đến việc cô ấy làm gì trên mạng hay trên điện thoại của cô ấy."
  <span class="quote-author">&mdash; Nam, 39 tuổi, Quan hệ nghiêm túc</span>
</div>
<p>
Ngược lại, một số người lại cho rằng nếu có lòng tin trọn vẹn thì chẳng có gì phải giấu giếm, và việc từ chối cho xem điện thoại chính là dấu hiệu của sự mờ ám:
</p>
<div class="quote-box">
  "Tôi nghĩ một mối quan hệ cởi mở và trung thực là điều tốt và lành mạnh khi nhìn thấy những gì vợ/chồng mình có trên điện thoại hoặc mạng xã hội. Nếu bạn cảm thấy không thoải mái với việc đó, tôi sẽ tự hỏi bạn đang giấu giếm điều gì."
  <span class="quote-author">&mdash; Nữ, 23 tuổi, Đang trong mối quan hệ</span>
</div>
<p>
Nhóm người tham gia đông nhất chọn cách tiếp cận nằm giữa sự minh bạch và sự riêng tư: đối tác có thể biết mật khẩu và có quyền mở máy vì sự tiện lợi, nhưng có ranh giới ngầm hiểu rằng không bao giờ được tự ý xem tin nhắn hay lục lọi dữ liệu cá nhân nếu không có sự đồng thuận rõ ràng:
</p>
<div class="quote-box">
  "Tôi và bạn trai dùng điện thoại của nhau khi tiện. Tôi sẽ không bao giờ xem bất cứ thứ gì mà anh ấy không muốn tôi thấy và tôi tin rằng anh ấy cũng vậy."
  <span class="quote-author">&mdash; Nữ, 23 tuổi, Đang trong mối quan hệ</span>
</div>

<h2 class="sec-heading">6. Sự Phản Bội Và Các Lý Do Biện Minh (Betrayals &amp; Justifications)</h2>

<h3 class="subsec-heading">6.1 Tần Suất Xâm Phạm Ranh Giới</h3>
<p>
Khảo sát của Norton chỉ ra rằng có tới <span class="stat-highlight">46%</span> người từng "theo dõi trên mạng" (online stalked) người yêu hiện tại hoặc người yêu cũ. Đáng chú ý, 35% cho biết họ không bận tâm nếu bị đối tác theo dõi trên mạng và 30% coi hành vi đó là vô hại (nam giới có tỷ lệ cảm thấy vô hại cao hơn nữ giới).
</p>
<p>
Các hình thức giám sát chủ động và tinh vi hơn xuất hiện ở một bộ phận: 9% từng "dụ dỗ bằng tài khoản ảo" (catfished) bạn đời; 8% theo dõi hoạt động thể chất; 10% dùng ứng dụng theo dõi bạn đời đang ở cùng ai (nam giới thực hiện hai hành vi sau cao hơn đáng kể so với nữ). Có tới <span class="stat-highlight">25%</span> người dưới 35 tuổi từng định vị vị trí của bạn đời mà không có sự đồng thuận. Đặc biệt, có tới <span class="stat-highlight">42%</span> người dưới 35 tuổi thừa nhận từng lén mở điện thoại của bạn đời để đọc tin nhắn, cuộc gọi, DM, email hoặc ảnh mà không được sự cho phép.
</p>

<h3 class="subsec-heading">6.2 Các Lý Do Biện Minh Cho Hành Vi Vượt Rào</h3>

<h4 class="subsubsec-heading">6.2.1 Tái thiết lập lòng tin (Trust Building)</h4>
<p>
Một số người giải thích rằng việc xem lén mang lại sự minh bạch cần thiết để gây dựng lại lòng tin sau khi đã từng bị phản bội:
</p>
<div class="quote-box">
  "Khi bạn mất lòng tin vào một người đã làm tổn thương mình, bạn sẽ luôn lén kiểm tra cho đến khi lòng tin đó được chuộc lại."
  <span class="quote-author">&mdash; Nữ, 20 tuổi, Đang trong mối quan hệ</span>
</div>
<p>
Trong dữ liệu của Norton, 27% người thừa nhận từng xem lén cho biết lý do là vì "Tôi không tin tưởng họ", và 34% cho biết vì "Tôi nghi ngờ họ đang làm điều gì đó mờ ám". Nữ giới có xu hướng viện dẫn lý do mất lòng tin cao hơn nam giới.
</p>

<h4 class="subsubsec-heading">6.2.2 Lo ngại về hành vi &amp; an toàn (Behavioral Concerns)</h4>
<p>
Một số người biện minh việc theo dõi là để bảo vệ bạn đời khỏi các thói quen tiêu cực hoặc bảo đảm an toàn:
</p>
<div class="quote-box">
  "Tôi cài định vị trên máy anh ấy để biết anh ấy ở đâu mọi lúc. Tôi cũng có ứng dụng để xem anh ấy đang làm gì trên điện thoại. Anh ấy mắc chứng nghiện rượu và tôi phải chắc chắn rằng anh ấy không đến những nơi có rượu bia."
  <span class="quote-author">&mdash; Nữ, 25 tuổi, Quan hệ nghiêm túc</span>
</div>
<p>
Bên cạnh đó, việc bạn đời lén lút xem nội dung khiêu dâm trên mạng cũng được nhiều người xem là một dạng "ngoại tình tư tưởng" và là lý do thôi thúc họ xem trộm điện thoại [58].
</p>

<h4 class="subsubsec-heading">6.2.3 Sự không chung thủy / Ngoại tình (Infidelity)</h4>
<p>
<strong>Nghi ngờ ngoại tình là lý do phổ biến và áp đảo nhất</strong> được đưa ra để biện minh cho việc phá vỡ ranh giới riêng tư đã thỏa thuận:
</p>
<div class="quote-box">
  "Sẽ là xâm phạm quyền riêng tư nếu người yêu tự ý đăng nhập mạng xã hội của bạn và đọc tin nhắn mà không có lý do. Tuy nhiên, nếu một người nghi ngờ đối phương đang lừa dối ngoại tình, tôi nghĩ việc xem trộm tuy xấu nhưng có thể biện minh được."
  <span class="quote-author">&mdash; Nam, 26 tuổi, Độc thân</span>
</div>
<p>
Dữ liệu của Norton xác nhận: 31% người tham gia đồng tình rằng "Theo dõi đối tác trên mạng là chấp nhận được nếu một hoặc cả hai người đã từng ngoại tình hoặc đang bị nghi ngờ ngoại tình".
</p>

<h2 class="sec-heading">7. Thảo Luận (Discussion)</h2>
<p>
Nghiên cứu chứng minh rằng việc chia sẻ quyền truy cập điện thoại xảy ra rất phổ biến trong các cặp đôi. Trong khi các nghiên cứu trước đây cho rằng chia sẻ xuất phát từ sự tiện lợi, dữ liệu của chúng tôi chỉ ra rằng: <em>sự tiện lợi chỉ là điều kiện cần, còn lòng tin mới chính là lý do cốt lõi để cấp quyền truy cập</em>.
</p>
<p>
Ranh giới giữa sự minh bạch lành mạnh và sự xâm phạm độc hại hoàn toàn nằm ở <strong>SỰ ĐỒNG THUẬN (CONSENT)</strong> giữa hai bên. Đáng tiếc là trong thực tế, các ranh giới này rất dễ bị phá vỡ vì sự bất lực của thiết kế công nghệ hiện tại. Do đó, cần biến các thỏa thuận mang tính cá nhân, ngầm định này thành những quy tắc có thể được thực thi bằng công nghệ.
</p>

<h3 class="subsec-heading">7.1 Khuyến Nghị Thiết Kế Hệ Thống (Design Recommendations)</h3>
<p>
Điện thoại thông minh hiện nay về cơ bản được thiết kế cho một người dùng duy nhất (single-user), thể hiện qua việc thiếu cơ chế xác thực thứ cấp cho các dịch vụ nhạy cảm. Để giải quyết mâu thuẫn này, chúng tôi đề xuất 3 giải pháp kỹ thuật:
</p>
<p>
<strong>1. Cơ chế Đa Hồ Sơ (Multi-User Profiles) trên thiết bị di động:</strong><br>
Các nhà phát triển hệ điều hành (Apple iOS, Google Android) nên bổ sung hoặc tối ưu tính năng đa hồ sơ với các cấp độ phân quyền khác nhau, tương tự như tài khoản Khách (Guest) trên máy tính cá nhân hoặc trong nhà thông minh [31, 46]. Chủ máy có thể tạo một hồ sơ phụ cho phép đối tác truy cập các ứng dụng thông thường (bản đồ, nghe nhạc, chụp ảnh, trò chơi) mà hoàn toàn ngăn cách với các dữ liệu nhạy cảm (tin nhắn cá nhân, email, tài khoản mạng xã hội, lịch sử duyệt web).
</p>
<p>
<strong>2. Xác thực cấp Phiên làm việc (Session-Level Authentication):</strong><br>
Tương tự như các ứng dụng ngân hàng và tài chính luôn yêu cầu xác thực mỗi khi mở ứng dụng, các ứng dụng giao tiếp, mạng xã hội và email nên tích hợp tùy chọn yêu cầu xác thực lại (FaceID, TouchID hoặc PIN riêng) cho từng phiên sử dụng. Việc này cho phép chủ máy thoải mái đưa điện thoại cho đối tác mượn mà không sợ bị xem lén nội dung tin nhắn.
</p>
<p>
<strong>3. Nâng cấp cơ chế PIN kép và Nhật ký truy cập (Dual PIN &amp; Access Logs):</strong><br>
Hiện nay mã PIN đóng vai trò tối cao (chìa khóa giải mã phần cứng) trên cả iOS và Android, khiến nó rất dễ bị lạm dụng nếu đối tác biết mã PIN. Hệ thống có thể triển khai cơ chế "Mã PIN kép" (Dual PIN): một mã PIN đầy đủ quyền quản trị và một mã PIN thứ cấp chỉ cho phép mở khóa các tính năng cơ bản. Đồng thời, việc cung cấp nhật ký ghi nhận thời gian và phương thức truy cập sẽ là bằng chứng cực kỳ quan trọng hỗ trợ bảo vệ các nạn nhân trong các vụ kiện tụng bạo hành bạn đời (IPV).
</p>

<h3 class="subsec-heading">7.2 Hướng Nghiên Cứu Tương Lai (Future Work)</h3>
<p>
Cần có thêm các nghiên cứu sâu rộng hơn để đánh giá sự ảnh hưởng của truyền thông đại chúng đối với định kiến ngoại tình và xem lén, cũng như khám phá tác động của các hành vi chia sẻ đối với các hình thức bạo hành được công nghệ hỗ trợ trong bối cảnh kiểm soát cưỡng chế [20, 23].
</p>

<h2 class="sec-heading">8. Kết Luận (Conclusion)</h2>
<p>
Thông qua việc phân tích hai tập dữ liệu quy mô lớn (N = 531 và N = 2.050), nghiên cứu này chứng minh rằng việc chia sẻ quyền truy cập điện thoại thông minh không phải lúc nào cũng mang tính tiêu cực; phần lớn các cặp đôi đều thực hiện điều này và coi đó là điều đáng mong muốn. Điểm mấu chốt để hành vi này mang tính tích cực là nó phải có tính tương hỗ (hai chiều), bình đẳng và có sự đồng thuận tuyệt đối của cả hai bên. Các khuyến nghị thiết kế hệ điều hành và ứng dụng di động được đề xuất nhằm trao cho người dùng công cụ công nghệ để thiết lập và bảo vệ các ranh giới tình cảm tinh tế này, đồng thời bảo vệ các nạn nhân trước nguy cơ bị kiểm soát và bạo hành.
</p>

<div class="page-break"></div>

<h2 class="sec-heading">Lời Cảm Ơn &amp; Tài Trợ (Acknowledgements)</h2>
<p>
Nghiên cứu này được tài trợ một phần bởi Quỹ Khoa học Quốc gia Hoa Kỳ (National Science Foundation - NSF) theo các mã tài trợ số 1916126 và 2016061.
</p>

<h2 class="sec-heading">Danh Mục Tài Liệu Tham Khảo (Selected References)</h2>
<div class="ref-list">
  <div class="ref-item">[1] I. S. Abbasi. Social media addiction in romantic relationships: Does user’s age influence vulnerability to social media infidelity? <em>Personality and Individual Differences</em>, 139:277–280, 2019.</div>
  <div class="ref-item">[7] A. O. Arikewuyo, K. K. Eluwole, and B. Özad. Influence of lack of trust on romantic relationship problems: The mediating role of partner cell phone snooping. <em>Psychological Reports</em>, 124(1):348–365, 2020.</div>
  <div class="ref-item">[9] R. Bellini, E. Tseng, N. McDonald, R. Greenstadt, D. McCoy, T. Ristenpart, and N. Dell. "So-called privacy breeds evil": Narrative justifications for intimate partner surveillance in online forums. <em>Proc. ACM Hum.-Comput. Interact. (CSCW3)</em>, 4:1–27, 2021.</div>
  <div class="ref-item">[13] Pew Research Center. Demographics of mobile device ownership and adoption in the United States, 2021.</div>
  <div class="ref-item">[14] R. Chatterjee, P. Doerfler, H. Orgad, S. Havron, J. Palmer, D. Freed, K. Levy, N. Dell, D. McCoy, T. Ristenpart, et al. The spyware used in intimate partner violence. In <em>IEEE Symposium on Security and Privacy (SP)</em>, pages 441–458, 2018.</div>
  <div class="ref-item">[24] R. L. Duran, L. Kelly, and T. Rotaru. Mobile phones in romantic relationships and the dialectic of autonomy versus connection. <em>Communication Quarterly</em>, 59(1):19–36, 2011.</div>
  <div class="ref-item">[28] D. Freed, J. Palmer, D. Minchala, K. Levy, T. Ristenpart, and N. Dell. “A stalkers paradise”. In <em>Proceedings of the 2018 CHI Conference on Human Factors in Computing Systems</em>, 2018.</div>
  <div class="ref-item">[35] E. J. Helsper and M. T. Whitty. Netiquette within married couples: Agreement about acceptable online behavior and surveillance between partners. <em>Computers in Human Behavior</em>, 26(5):916–926, 2010.</div>
  <div class="ref-item">[48] T. Matthews, K. Liao, A. Turner, M. Berkovich, R. Reeder, and S. Consolvo. "She’ll just grab any device that’s closer". In <em>Proceedings of the 2016 CHI Conference on Human Factors in Computing Systems</em>, 2016.</div>
  <div class="ref-item">[52] S. Petronio. Communication privacy management theory: What do we know about family privacy regulation? <em>Journal of Family Theory &amp; Review</em>, 2(3):175–196, 2010.</div>
  <div class="ref-item">[62] E. Stark. <em>Coercive Control: How Men Entrap Women in Personal Life</em>. Oxford University Press, 2007 / Jessica Kingsley Publishers, 2013.</div>
  <div class="ref-item">[71] D. Woodlock. The abuse of technology in domestic violence and stalking. <em>Violence Against Women</em>, 23(5):584–602, 2017.</div>
  <div class="ref-item">[74] Y. Wu, W. K. Edwards, and S. Das. SoK: Social cybersecurity. In <em>IEEE Symposium on Security and Privacy (SP)</em>, pages 1863–1879, 2022.</div>
</div>

<div class="page-break"></div>

<h2 class="sec-heading">Phụ Lục Nghiên Cứu (Appendix)</h2>

<h3 class="subsec-heading">Khóa Điện Thoại Và Các Yếu Tố Nhân Khẩu Học</h3>
<p>
Gen Z có tỷ lệ khóa điện thoại cao hơn đáng kể so với các thế hệ khác (&chi;&sup2;(8, 460) = 2.02, p = .044), với khả năng khóa máy cao hơn <span class="stat-highlight">139%</span> (OR = 2.39, 95% CI [1.04, 5.74]). Gen Z lớn lên cùng điện thoại thông minh và có thói quen bảo vệ thiết bị nghiêm ngặt hơn.
</p>
<p>
Về hệ điều hành: 81% người dùng Android (N = 253) và 92.2% người dùng iPhone (N = 206) có khóa máy (&chi;&sup2;(8, 460) = 2.48, p = .013). Khi giữ nguyên các yếu tố khác, người dùng iOS có xác suất khóa máy cao hơn <span class="stat-highlight">134%</span> so với người dùng Android (OR = 2.34, 95% CI [1.22, 4.72]).
</p>

<div class="table-title">Bảng 4: Mô hình Hồi quy Logistic dự đoán xác suất người tham gia khóa điện thoại</div>
<table class="data-table">
  <thead>
    <tr>
      <th>Biến độc lập</th>
      <th>Hệ số hồi quy (Coef)</th>
      <th>Sai số chuẩn (SE)</th>
      <th>Giá trị p</th>
      <th>Tỷ số chênh (OR)</th>
      <th>95% CI Dưới</th>
      <th>95% CI Trên</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Giới tính - Nam giới (Male)</strong></td>
      <td>0.849</td>
      <td>0.362</td>
      <td><strong>0.019</strong></td>
      <td>2.34</td>
      <td>1.17</td>
      <td>4.89</td>
    </tr>
    <tr>
      <td><strong>Thế hệ - Gen Z</strong></td>
      <td>0.870</td>
      <td>0.431</td>
      <td><strong>0.044</strong></td>
      <td>2.39</td>
      <td>1.04</td>
      <td>5.74</td>
    </tr>
    <tr>
      <td>Thế hệ - Millennial</td>
      <td>-0.187</td>
      <td>0.366</td>
      <td>0.609</td>
      <td>0.829</td>
      <td>0.400</td>
      <td>1.69</td>
    </tr>
    <tr>
      <td>Thuộc cộng đồng LGBTQ+</td>
      <td>0.564</td>
      <td>0.636</td>
      <td>0.375</td>
      <td>1.76</td>
      <td>0.580</td>
      <td>7.65</td>
    </tr>
    <tr>
      <td><strong>Người dùng iOS (Apple iPhone)</strong></td>
      <td>0.8508</td>
      <td>0.343</td>
      <td><strong>0.013</strong></td>
      <td>2.34</td>
      <td>1.22</td>
      <td>4.72</td>
    </tr>
    <tr>
      <td>Kiến thức kỹ thuật công nghệ</td>
      <td>-0.2285</td>
      <td>0.168</td>
      <td>0.175</td>
      <td>0.796</td>
      <td>0.564</td>
      <td>1.09</td>
    </tr>
  </tbody>
</table>

<div class="table-title">Bảng 5: Tỷ lệ khóa điện thoại theo độ tuổi và tình trạng mối quan hệ</div>
<table class="data-table">
  <thead>
    <tr>
      <th rowspan="2">Nhóm đối tượng</th>
      <th colspan="2">Gen Z (18-25)</th>
      <th colspan="2">Millennial (26-40)</th>
      <th colspan="2">Gen X (41-59)</th>
      <th colspan="2">Boomers (60+)</th>
    </tr>
    <tr>
      <th>N</th>
      <th>% Khóa</th>
      <th>N</th>
      <th>% Khóa</th>
      <th>N</th>
      <th>% Khóa</th>
      <th>N</th>
      <th>% Khóa</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Tất cả</strong></td>
      <td>171</td>
      <td>93.6%</td>
      <td>154</td>
      <td>85.1%</td>
      <td>103</td>
      <td>81.6%</td>
      <td>32</td>
      <td>65.6%</td>
    </tr>
    <tr>
      <td>Độc thân</td>
      <td>37</td>
      <td>89.2%</td>
      <td>15</td>
      <td>93.3%</td>
      <td>5</td>
      <td>100.0%</td>
      <td>1</td>
      <td>0.0%</td>
    </tr>
    <tr>
      <td>Đang có quan hệ</td>
      <td>134</td>
      <td>94.8%</td>
      <td>139</td>
      <td>84.2%</td>
      <td>98</td>
      <td>80.6%</td>
      <td>31</td>
      <td>67.7%</td>
    </tr>
    <tr>
      <td>- Quan hệ nghiêm túc</td>
      <td>26</td>
      <td>80.8%</td>
      <td>81</td>
      <td>82.7%</td>
      <td>75</td>
      <td>80.0%</td>
      <td>21</td>
      <td>76.2%</td>
    </tr>
    <tr>
      <td>- Quan hệ ít nghiêm túc hơn</td>
      <td>108</td>
      <td>98.1%</td>
      <td>58</td>
      <td>86.2%</td>
      <td>23</td>
      <td>82.6%</td>
      <td>10</td>
      <td>50.0%</td>
    </tr>
  </tbody>
</table>

<div class="table-title">Bảng 6: Mô hình Hồi quy Logistic dự đoán người tham gia chia sẻ quyền truy cập ngầm định (Implicit Access)</div>
<table class="data-table">
  <thead>
    <tr>
      <th>Biến độc lập</th>
      <th>Hệ số hồi quy (Coef)</th>
      <th>Sai số chuẩn (SE)</th>
      <th>Giá trị p</th>
      <th>Tỷ số chênh (OR)</th>
      <th>95% CI Dưới</th>
      <th>95% CI Trên</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Giới tính - Nam giới (Male)</strong></td>
      <td>-0.905</td>
      <td>0.376</td>
      <td><strong>0.0161</strong></td>
      <td>0.404</td>
      <td>0.187</td>
      <td>0.824</td>
    </tr>
    <tr>
      <td>Thế hệ - Gen Z</td>
      <td>-0.934</td>
      <td>0.541</td>
      <td>0.0843</td>
      <td>0.393</td>
      <td>0.127</td>
      <td>1.09</td>
    </tr>
    <tr>
      <td>Thế hệ - Millennial</td>
      <td>0.223</td>
      <td>0.374</td>
      <td>0.552</td>
      <td>1.25</td>
      <td>0.602</td>
      <td>2.63</td>
    </tr>
    <tr>
      <td>Quan hệ nghiêm túc</td>
      <td>0.575</td>
      <td>0.373</td>
      <td>0.123</td>
      <td>1.78</td>
      <td>0.869</td>
      <td>3.78</td>
    </tr>
    <tr>
      <td>Thuộc cộng đồng LGBTQ+</td>
      <td>-0.459</td>
      <td>0.646</td>
      <td>0.477</td>
      <td>0.632</td>
      <td>0.143</td>
      <td>1.97</td>
    </tr>
    <tr>
      <td><strong>Người dùng iOS (Apple iPhone)</strong></td>
      <td>-0.985</td>
      <td>0.377</td>
      <td><strong>0.0089</strong></td>
      <td>0.374</td>
      <td>0.171</td>
      <td>0.759</td>
    </tr>
  </tbody>
</table>

<div class="table-title">Bảng 7: Mô hình Hồi quy Logistic dự đoán người tham gia chia sẻ quyền truy cập tường minh (Explicit Access)</div>
<table class="data-table">
  <thead>
    <tr>
      <th>Biến độc lập</th>
      <th>Hệ số hồi quy (Coef)</th>
      <th>Sai số chuẩn (SE)</th>
      <th>Giá trị p</th>
      <th>Tỷ số chênh (OR)</th>
      <th>95% CI Dưới</th>
      <th>95% CI Trên</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Giới tính - Nam giới (Male)</td>
      <td>-0.359</td>
      <td>0.236</td>
      <td>0.129</td>
      <td>0.699</td>
      <td>0.439</td>
      <td>1.11</td>
    </tr>
    <tr>
      <td><strong>Thế hệ - Gen Z</strong></td>
      <td>1.219</td>
      <td>0.344</td>
      <td><strong>0.0004</strong></td>
      <td>3.38</td>
      <td>1.74</td>
      <td>6.73</td>
    </tr>
    <tr>
      <td>Thế hệ - Millennial</td>
      <td>0.384</td>
      <td>0.295</td>
      <td>0.193</td>
      <td>1.47</td>
      <td>0.826</td>
      <td>2.63</td>
    </tr>
    <tr>
      <td><strong>Quan hệ nghiêm túc (Serious Relationship)</strong></td>
      <td>0.821</td>
      <td>0.265</td>
      <td><strong>0.0019</strong></td>
      <td>2.27</td>
      <td>1.36</td>
      <td>3.86</td>
    </tr>
    <tr>
      <td>Thuộc cộng đồng LGBTQ+</td>
      <td>0.201</td>
      <td>0.344</td>
      <td>0.559</td>
      <td>1.22</td>
      <td>0.626</td>
      <td>2.43</td>
    </tr>
    <tr>
      <td>Người dùng iOS (Apple iPhone)</td>
      <td>0.096</td>
      <td>0.228</td>
      <td>0.674</td>
      <td>1.10</td>
      <td>0.703</td>
      <td>1.72</td>
    </tr>
  </tbody>
</table>

</body>
</html>
"""

def main():
    print("================================================================================")
    print("TIẾN TRÌNH BIÊN DỊCH VÀ XUẤT FILE PDF BÀI BÁO KHOA HỌC SANG THƯ MỤC DOWNLOADS")
    print(f"File PDF đích: {OUTPUT_PDF}")
    print("================================================================================")

    with open(TEMP_HTML, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"[OK] Đã tạo file HTML trung gian: {TEMP_HTML}")

    cmd = [
        EDGE_PATH,
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={OUTPUT_PDF}",
        TEMP_HTML
    ]
    print("[...] Đang khởi chạy trình xuất PDF chuẩn công nghệ cao...")
    result = subprocess.run(cmd, capture_output=True, text=True)

    if os.path.exists(OUTPUT_PDF) and os.path.getsize(OUTPUT_PDF) > 1000:
        file_size_kb = os.path.getsize(OUTPUT_PDF) / 1024
        print(f"[THÀNH CÔNG] File PDF đã được tạo hoàn chỉnh!")
        print(f"Kích thước file: {file_size_kb:.2f} KB")
        print(f"Đường dẫn file: {OUTPUT_PDF}")
    else:
        print("[LỖI] Không thể tạo file PDF:")
        print("Stdout:", result.stdout)
        print("Stderr:", result.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
