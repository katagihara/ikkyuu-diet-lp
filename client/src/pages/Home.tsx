/*
 * 美容整体サロン vivari LP
 * Design: Figma 1920w light - pixel-perfect reproduction
 * Colors: #f39f88 (accent/heading), #4b4f58 (subheading), #736357 (body), #3a3a3a (dark text)
 * CTA LINE: https://lin.ee/XoPtWqp (QR code page)
 * CTA HPB: https://beauty.hotpepper.jp/kr/slnH000719702/ (iframe page)
 * 口コミ: https://beauty.hotpepper.jp/kr/slnH000719702/review/ (accordion)
 * Map address: 兵庫県西宮市門戸東町２－４ファミリアル門戸103
 */

import { useState } from "react";
// MapView removed: replaced with Google Maps embed iframe for GitHub Pages compatibility


// 画像は client/public/images/ に同梱している。
// 以前は Manus の CDN にホットリンクしていたが、配信が止まった時点で
// ページ上の画像が一斉に表示されなくなったため、自前ホスティングに切り替えた。
// import.meta.env.BASE_URL を挟むことで GitHub Pages のサブパス配信にも対応する。
// 各ファイルが LP のどこで使われるかは docs/lp-images.md を参照。
const IMG = `${import.meta.env.BASE_URL}images`;

const ASSETS: Record<string, string> = {
  "39-5":       `${IMG}/fv.webp`,  // ファーストビュー（ページ最上部の大きなビジュアル）
  "39-20":      `${IMG}/ba-01.webp`,  // ビフォーアフター 50代② -10.8kg
  "39-22":      `${IMG}/ba-02.webp`,  // ビフォーアフター 40代 -8.8kg
  "39-24":      `${IMG}/ba-03.webp`,  // ビフォーアフター 40代③ -8.9kg
  "39-26":      `${IMG}/ba-04.webp`,  // ビフォーアフター 30代② -10kg
  "39-28":      `${IMG}/ba-05.webp`,  // ビフォーアフター 50代 -7.5kg
  "39-30":      `${IMG}/ba-06.webp`,  // ビフォーアフター 50代② -14.9kg
  "39-32":      `${IMG}/ba-07.webp`,  // ビフォーアフター 40代② -8.1kg
  "photo1":     `${IMG}/voice-01.png`,  // 口コミ写真グリッド 1行目1列目（施術写真1）
  "photo2":     `${IMG}/voice-02.png`,  // 口コミ写真グリッド 1行目2列目（施術写真2）
  "photo3":     `${IMG}/voice-03.png`,  // 口コミ写真グリッド 1行目3列目（施術写真3）
  "photo6":     `${IMG}/voice-04.png`,  // 口コミ写真グリッド 1行目4列目（施術写真4）
  "photo7":     `${IMG}/voice-05.png`,  // 口コミ写真グリッド 2行目1列目（施術写真5）
  "photo8":     `${IMG}/voice-06.png`,  // 口コミ写真グリッド 2行目2列目（施術写真6）
  "photo9":     `${IMG}/voice-07.png`,  // 口コミ写真グリッド 2行目3列目（施術写真7）
  "photo2shot2":`${IMG}/voice-08.png`,  // 口コミ写真グリッド 2行目4列目（２ショット写真）
  "64-24":      `${IMG}/voice-09.webp`,  // 口コミ写真グリッド 3行目1列目
  "64-16":      `${IMG}/voice-10.webp`,  // 口コミ写真グリッド 3行目2列目
  "photo2shot": `${IMG}/voice-11.png`,  // 口コミ写真グリッド 3行目3列目（２ショット写真・旧）
  "64-18":      `${IMG}/voice-12.webp`,  // 口コミ写真グリッド 3行目4列目
  "39-106":     `${IMG}/kodawari-01.webp`,  // ３つのこだわり 01：個室のプライベート空間
  "39-111":     `${IMG}/kodawari-02.webp`,  // ３つのこだわり 02：個別プランのご提案
  "39-115":     `${IMG}/kodawari-03.webp`,  // ３つのこだわり 03：全身美容整体
  "39-128":     `${IMG}/staff-ando.webp`,  // スタッフ紹介 安東（丸くトリミングされる顔写真）
  "44-289":     `${IMG}/staff-yamazaki.webp`,  // スタッフ紹介 山崎 雅弘（丸くトリミングされる顔写真）
  "44-290":     `${IMG}/staff-ikemoto.webp`,  // スタッフ紹介 院長 池本 有佑（丸くトリミングされる顔写真）
  "39-181":     `${IMG}/shop-exterior.webp`,  // 店舗情報の店舗外観写真
  "44-282":     `${IMG}/book.webp`,  // BOOK特典「1週間で痩せ体質になるダイエット」の書影
  "39-251":     `${IMG}/reason-01.webp`,  // 成功する理由１：太った理由を徹底分析（カウンセリング写真）
  "39-256":     `${IMG}/reason-02.webp`,  // 成功する理由２：痩身整体（施術写真）
  "39-261":     `${IMG}/reason-03.webp`,  // 成功する理由３：マンツーマン食事サポート（食事写真）
  "62-3":       `${IMG}/reason-04.webp`,  // 成功する理由４：国家資格 柔道整復師
  "line-qr":    `${IMG}/line-qr.png`,  // LINE友だち追加ページのQRコード
};

const LINE_URL = "https://lin.ee/XoPtWqp";
const HPB_URL = "https://beauty.hotpepper.jp/kr/slnH000719702/";
const IKKYUU_URL = "https://beauty.hotpepper.jp/kr/slnH000719702/";


// Page types
type PageType = "home" | "line" | "hpb";

// CTA Block component (reused multiple times)
function CTABlock({ onNavigate }: { onNavigate: (page: PageType) => void }) {
  return (
    <div className="w-full py-8 flex flex-col items-center gap-2">
      <a
        href={LINE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-3 bg-[#4dce6e] text-white font-semibold text-xl rounded-[3px] px-8 py-3 w-full max-w-[321px] hover:opacity-90 transition-opacity"
      >
        <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
        </svg>
        LINE講座をスタート
      </a>
      <p className="text-[#3a3a3a] text-[15px] text-center">1週間で痩せ体質を作る無料講座をプレゼント中🎁</p>
      <a
        href={HPB_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-3 bg-[#bf1391] text-white font-semibold text-xl rounded-[3px] px-8 py-3 w-full max-w-[392px] hover:opacity-90 transition-opacity"
      >
        <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/>
        </svg>
        ホットペッパーで予約する
      </a>
      <p className="text-[#3a3a3a] text-sm text-center">今すぐ予約したい方はこちらからどうぞ</p>
      <p className="text-[#3a3a3a] text-sm text-center">ダイエットカウンセリングが初回限定1980円🎉</p>
    </div>
  );
}

// Section heading component
function SectionHeading({ title, size = "28" }: { title: string; size?: string }) {
  return (
    <h2 style={{ fontSize: `${size}px`, color: "#f39f88" }} className="font-bold leading-tight mb-2 whitespace-pre-line">{title}</h2>
  );
}

// Sub heading component
function SubHeading({ title }: { title: string }) {
  return (
    <h3 className="text-[#4b4f58] text-lg font-semibold mb-3">{title}</h3>
  );
}

// Body text component
function BodyText({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[#736357] text-base font-normal leading-relaxed">{children}</p>
  );
}

// List item with bullet
function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 py-1">
      <span className="text-[#f39f88] text-xl mt-0.5 flex-shrink-0">✓</span>
      <span className="text-[#736357] text-base">{children}</span>
    </div>
  );
}

// Divider
function SectionDivider() {
  return <div className="w-full border-t border-neutral-200 mb-6 mt-2" />;
}

// Voice_S SNS口コミ写真グリッド
// 行1: photo1, photo2, photo3, photo6
// 行2: photo7, photo8, photo9, photo2shot2(新しい２ショット=右端真ん中)
// 行3: 64-24, 64-16, photo2shot(旧２ショット), 64-18
const voiceImages = [
  // 行1 (左上から順に新しい写真)
  { id: "photo1", alt: "施術写真1" },
  { id: "photo2", alt: "施術写真2" },
  { id: "photo3", alt: "施術写真3" },
  { id: "photo6", alt: "施術写真4" },
  // 行2
  { id: "photo7", alt: "施術写真5" },
  { id: "photo8", alt: "施術写真6" },
  { id: "photo9", alt: "施術写真7" },
  { id: "photo2shot2", alt: "２ショット写真" },
  // 行3
  { id: "64-24", alt: "口コミ写真9" },
  { id: "64-16", alt: "口コミ写真10" },
  { id: "photo2shot", alt: "２ショット写真（旧）" },
  { id: "64-18", alt: "口コミ写真12" },
];

// BA images (ビフォーアフター)
const baImages = [
  { id: "39-20", alt: "50代② ビフォーアフター -10.8kg" },
  { id: "39-22", alt: "40代 ビフォーアフター -8.8kg" },
  { id: "39-24", alt: "40代③ ビフォーアフター -8.9kg" },
  { id: "39-26", alt: "30代② ビフォーアフター -10kg" },
  { id: "39-28", alt: "50代 ビフォーアフター -7.5kg" },
  { id: "39-30", alt: "50代② ビフォーアフター -14.9kg" },
  { id: "39-32", alt: "40代② ビフォーアフター -8.1kg" },
];

// Home page component
function HomePage({ onNavigate }: { onNavigate: (page: PageType) => void }) {

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
      <div className="max-w-[700px] mx-auto">

        {/* ===== FV (ファーストビュー) ===== */}
        <section className="w-full">
          <img
            src={ASSETS["39-5"]}
            alt="美容整体サロン vivari ファーストビュー"
            className="w-full h-auto object-cover"
          />
        </section>

        {/* ===== CTA 1 ===== */}
        <div className="px-4">
          <CTABlock onNavigate={onNavigate} />
        </div>

        {/* ===== B/A実績 ===== */}
        <section className="w-full px-4 py-4">
          <div className="flex flex-col gap-8">
            {baImages.map((img) => (
              <div key={img.id} className="w-full">
                <img
                  src={ASSETS[img.id]}
                  alt={img.alt}
                  className="w-full h-auto object-contain"
                />
              </div>
            ))}
          </div>
        </section>

        {/* ===== CONCEPT ===== */}
        <section className="w-full px-4 py-8">
          <SectionDivider />
          <SectionHeading title={"CONCEPT\n我慢しない、無理しないで自分らしく痩せる"} />
          <div className="mt-4 space-y-4">
            <BodyText>
              本当はもう少しカラダを引き締めたい。理想のボディラインがある。でも…「筋トレはきついし、甘いものも食べたいし…」という女性の方へ。
            </BodyText>
            <BodyText>
              当店の我慢しないダイエットはいかがですか？「筋トレなし、無理な食事制限なし」なのにストレスなく痩せていく。その後もリバウンドしにくいカラダをずーっとキープしていく。
            </BodyText>
            <BodyText>
              国家資格である柔道整復師。プロの資格を所有しているので、我慢しないダイエットが実現可能です。
            </BodyText>
          </div>
        </section>

        {/* ===== Voice_S (SNS口コミ写真グリッド) ===== */}
        <section className="w-full px-4 py-4">
          <div className="grid grid-cols-4 gap-0.5">
            {voiceImages.map((img) => (
              <div key={img.id} className="aspect-square overflow-hidden">
                <img
                  src={ASSETS[img.id]}
                  alt={img.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

         </section>

        {/* ===== ３つのこだわり ===== */}
        <section className="w-full px-4 py-8">
          <SectionDivider />
          <SectionHeading title="３つのこだわり" />

          <div className="mb-8 mt-4">
            <SubHeading title="01：個室のプライベート空間" />
            <img
              src={ASSETS["39-106"]}
              alt="個室のプライベート空間"
              className="w-full h-auto object-cover rounded mb-3"
            />
            <BodyText>
              プライベート空間になります。多くの場合、お客様ひとりずつでの接遇です。周りを気にせずに、なんでもご相談ください。
            </BodyText>
          </div>

          <div className="mb-8">
            <SubHeading title="02：おひとりおひとりに合わせた無理のないプランをご提案します" />
            <img
              src={ASSETS["39-111"]}
              alt="個別プランのご提案"
              className="w-full h-auto object-cover rounded mb-3"
            />
            <BodyText>
              カウンセリングではお身体の状態を聞かせて頂き、お悩みに沿って無理なく痩せるプランをご提案できます。
            </BodyText>
          </div>

          <div className="mb-8">
            <SubHeading title="03：ダイエットだけじゃない！全身美容整体も施します" />
            <img
              src={ASSETS["39-115"]}
              alt="全身美容整体"
              className="w-full h-auto object-cover rounded mb-3"
            />
            <BodyText>
              ダイエットはもちろんのこと、ストレートネック、反り腰、猫背、産後の骨盤矯正、小顔調整など、美しい姿勢改善もまるごと全部ご提供しています。痛みや疲れが取れて、痩せて見た目が良くなるって良いとは思いませんか？
            </BodyText>
          </div>
        </section>

        {/* ===== スタッフ紹介 ===== */}
        <section className="w-full px-4 py-8">
          <SectionDivider />
          <SectionHeading title="スタッフ紹介" />

          {/* スタッフ：安東 */}
          <div className="mb-10 mt-4">
            <SubHeading title="スタッフ：安東" />
            <div className="flex justify-center my-5">
              <div className="w-44 h-44 rounded-full overflow-hidden border-2 border-[#f39f88]/20">
                <img
                  src={ASSETS["39-128"]}
                  alt="スタッフ 安東"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <ListItem>21歳</ListItem>
              <ListItem>柔道整復師</ListItem>
            </div>
            <div className="mt-3">
              <BodyText>
                「女性がキレイで自分らしくなれる美容整体」をご提供します。<br />
                お子様連れでもご安心いただけます。女性特有のお悩みをお気軽にご相談ください。<br />
                優しい施術とカウンセリングが、お客様から喜ばれております。
              </BodyText>
            </div>
          </div>

          <SectionDivider />

          {/* スタッフ：山崎 雅弘 */}
          <div className="mb-10">
            <SubHeading title="スタッフ：山崎　雅弘" />
            <div className="flex justify-center my-5">
              <div className="w-44 h-44 rounded-full overflow-hidden bg-[#d9d9d9]">
                <img
                  src={ASSETS["44-289"]}
                  alt="スタッフ 山崎雅弘"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <ListItem>キャリア9年</ListItem>
              <ListItem>国家資格：柔道整復師 所有</ListItem>
            </div>
            <div className="mt-3">
              <BodyText>
                整体サロンを運営していくなかで、女性の「痩せたい！でも無理したくない！」というリクエストにお答えしてきました。きっとあなたの願望も実現できると思います。ぜひ一度、「初回体験セッション」で当店の我慢しないダイエットコースがどのようなものか？を体験してください。
              </BodyText>
            </div>
          </div>

          <SectionDivider />

          {/* 院長：池本 有佑 */}
          <div className="mb-10">
            <SubHeading title="院長：池本　有佑" />
            <div className="flex justify-center my-5">
              <div className="w-44 h-44 rounded-full overflow-hidden bg-[#d9d9d9]">
                <img
                  src={ASSETS["44-290"]}
                  alt="院長 池本有佑"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <ListItem>キャリア20年</ListItem>
              <ListItem>国家資格：柔道整復師・はり / きゅう師所有</ListItem>
            </div>
            <div className="mt-3">
              <BodyText>
                「練習と同じくらいメンテナンスが大切」を理念に、皆様の健康をサポートしています。<br />
                身体が変わっていくプロセスを一緒に楽しみながら、理想の自分を手に入れましょう。<br />
                お客様一人ひとりのお悩みに寄り添い、今よりさらに良くなるためのお手伝いをさせていただきます。どうぞお気軽にご相談ください。
              </BodyText>
            </div>
          </div>
        </section>

        {/* ===== 店舗情報 ===== */}
        <section className="w-full px-4 py-8">
          <SectionDivider />
          <h2 className="text-[#f39f88] text-[32px] font-semibold mb-4">店舗情報</h2>
          <img
            src={ASSETS["39-181"]}
            alt="店舗外観"
            className="w-full h-auto object-cover rounded mb-5"
          />
          <div className="space-y-2 mb-6">
            <ListItem>営業時間：月～金：8:30~12:30  15:00~19:30 / 土：8:30~12:30</ListItem>
            <ListItem>定休日：土曜午後・日曜・祝日</ListItem>
            <ListItem>住所：兵庫県西宮市門戸東町２－４ファミリアル門戸１０３</ListItem>
            <ListItem>現金・クレジットカード・PayPay・その他QR決済</ListItem>
          </div>

          {/* Google Map - 埋め込みiFrame（GitHub Pages対応） */}
          <div className="w-full rounded overflow-hidden shadow-md">
            <iframe
              src="https://maps.google.com/maps?q=%E3%81%84%E3%81%A3%E3%81%8D%E3%82%85%E3%81%86%E9%8D%BC%E7%81%B8%E6%95%B4%E9%AA%A8%E9%99%A2+%E8%A5%BF%E5%AE%AE%E5%B8%82+%E9%96%80%E6%88%B8%E6%9D%B1%E7%94%BA&output=embed&z=16"
              width="100%"
              height="432"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="美容整体サロン vivari 地図"
            />
          </div>
        </section>

        {/* ===== BOOK特典 1 ===== */}
        <section className="w-full px-4 py-6 flex justify-center">
          <img
            src={ASSETS["44-282"]}
            alt="BOOK特典 1週間で痩せ体質になるダイエット"
            className="w-[280px] h-auto object-contain"
            style={{ transform: "rotate(3deg)" }}
          />
        </section>

        {/* ===== CTA 2 ===== */}
        <div className="px-4">
          <CTABlock onNavigate={onNavigate} />
        </div>

        {/* ===== 当店のダイエットが成功する理由 ===== */}
        <section className="w-full px-4 py-8">
          <h2 className="text-[#f39f88] text-[32px] font-semibold mb-6">当店のダイエットが成功する理由</h2>

          {/* 理由１ - 枠線付き */}
          <div className="mb-6 rounded border-2 border-neutral-200 overflow-hidden">
            <div className="px-5 pt-6 pb-2">
              <p className="text-[#f39f88] text-[26px] font-semibold">理由１：太った理由を徹底分析</p>
            </div>
            <div className="flex justify-center px-4 py-3">
              <img src={ASSETS["39-251"]} alt="理由１カウンセリング写真" className="w-[400px] max-w-full h-auto object-cover" />
            </div>
            <div className="px-5 pb-6">
              <BodyText>肥満DNA検査による自分のスーパーフード知ることができ、分子栄養学を用いて体質を考慮した効率的なダイエットメニューを作成します。</BodyText>
            </div>
          </div>

          {/* 理由２ - 枠線付き */}
          <div className="mb-6 rounded border-2 border-neutral-200 overflow-hidden">
            <div className="px-5 pt-6 pb-2">
              <p className="text-[#f39f88] text-[26px] font-semibold">理由２：痩身整体で生涯太りにくい体質作り</p>
            </div>
            <div className="flex justify-center px-4 py-3">
              <img src={ASSETS["39-256"]} alt="理由２施術写真" className="w-[400px] max-w-full h-auto object-cover" />
            </div>
            <div className="px-5 pb-6">
              <BodyText>主に姿勢矯正と骨盤矯正を行なって、痩せやすい体づくりをしていきます。</BodyText>
            </div>
          </div>

          {/* 理由３ - 枠線付き */}
          <div className="mb-6 rounded border-2 border-neutral-200 overflow-hidden">
            <div className="px-5 pt-6 pb-2">
              <p className="text-[#f39f88] text-[26px] font-semibold">理由３：マンツーマン食事サポート</p>
            </div>
            <div className="flex justify-center px-4 py-3">
              <img src={ASSETS["39-261"]} alt="理由３食事写真" className="w-[400px] max-w-full h-auto object-cover" />
            </div>
            <div className="px-5 pb-6">
              <BodyText>LINEでサポート！楽しく続く食習慣を形成していきます。</BodyText>
            </div>
          </div>

          {/* 理由４ - 枠線付き */}
          <div className="mb-6 rounded border-2 border-neutral-200 overflow-hidden">
            <div className="px-5 pt-6 pb-2">
              <p className="text-[#f39f88] text-[26px] font-semibold">理由４：国家資格の柔道整復師を所有。だから安心！</p>
            </div>
            <div className="flex justify-center px-4 py-3">
              <img src={ASSETS["62-3"]} alt="理由４国家資格" className="w-[400px] max-w-full h-auto object-cover" />
            </div>
            <div className="px-5 pb-6">
              <BodyText>体の構造を知り尽くした、プロの整体師の証である「国家資格：柔道整復師」。<br />安心してダイエットを任せることができます。</BodyText>
            </div>
          </div>
        </section>

        {/* ===== CTA 3 ===== */}
        <div className="px-4">
          <CTABlock onNavigate={onNavigate} />
        </div>

        {/* Footer */}
        <footer className="w-full px-4 py-8 border-t border-gray-200 text-center">
          <p className="text-[#736357] text-sm">© 2026 美容整体サロン vivari. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

// LINE QRコードページ
function LinePage({ onNavigate }: { onNavigate: (page: PageType) => void }) {
  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
      {/* ヘッダーバー */}
      <div className="w-full bg-[#4dce6e] px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => onNavigate("home")}
          className="text-white font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          戻る
        </button>
        <span className="text-white font-bold text-lg">LINE友だち追加</span>
      </div>

      <div className="max-w-[480px] mx-auto w-full flex-1 px-6 py-10 flex flex-col items-center">
        {/* LINE ロゴ＆タイトル */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-[#4dce6e] rounded-xl flex items-center justify-center">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
            </svg>
          </div>
          <div>
            <p className="text-[#3a3a3a] font-bold text-xl">美容整体サロン vivari</p>
            <p className="text-[#736357] text-sm">LINE公式アカウント</p>
          </div>
        </div>

        <p className="text-[#f39f88] text-2xl font-bold mt-6 mb-2 text-center">
          1週間で痩せ体質を作る<br />無料講座をプレゼント中🎁
        </p>
        <p className="text-[#736357] text-base text-center mb-8">
          QRコードをスキャンするか、<br />下のボタンからLINEを開いてください
        </p>

        {/* QRコード */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-neutral-100">
          <img
            src={ASSETS["line-qr"]}
            alt="LINE QRコード"
            className="w-56 h-56 object-contain"
          />
        </div>

        {/* LINEで開くボタン */}
        <a
          href={LINE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 bg-[#4dce6e] text-white font-bold text-lg rounded-xl px-10 py-4 w-full max-w-[320px] hover:opacity-90 transition-opacity shadow-md"
        >
          <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
          </svg>
          LINEで友だち追加
        </a>

        <p className="text-[#736357] text-sm mt-4 text-center">
          ※ LINEアプリが開きます
        </p>

        {/* 戻るボタン */}
        <button
          onClick={() => onNavigate("home")}
          className="mt-8 text-[#736357] text-sm hover:underline"
        >
          ← ランディングページに戻る
        </button>
      </div>
    </div>
  );
}

// HPBページ（ホットペッパービューティー予約）
function HpbPage({ onNavigate }: { onNavigate: (page: PageType) => void }) {
  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
      {/* ヘッダーバー */}
      <div className="w-full bg-[#bf1391] px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => onNavigate("home")}
          className="text-white font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          戻る
        </button>
        <span className="text-white font-bold text-lg">ホットペッパービューティーで予約</span>
        <a
          href={HPB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-white/80 text-xs hover:text-white flex items-center gap-1"
        >
          別タブで開く
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {/* iFrame */}
      <iframe
        src={HPB_URL}
        title="ホットペッパービューティー 予約"
        className="w-full flex-1"
        style={{ border: "none", minHeight: "calc(100vh - 52px)" }}
        loading="lazy"
      />
    </div>
  );
}

// Main App component
export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageType>("home");

  const handleNavigate = (page: PageType) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {currentPage === "home" && <HomePage onNavigate={handleNavigate} />}
      {currentPage === "line" && <LinePage onNavigate={handleNavigate} />}
      {currentPage === "hpb" && <HpbPage onNavigate={handleNavigate} />}
    </>
  );
}
