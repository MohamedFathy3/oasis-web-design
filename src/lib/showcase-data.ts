import printing from "@/assets/printing.jpg.asset.json";
import animation from "@/assets/animation.jpg.asset.json";
import events from "@/assets/events.jpg.asset.json";
import seo from "@/assets/seo.jpg.asset.json";
import video from "@/assets/video.jpg.asset.json";
import website from "@/assets/website.jpg.asset.json";
import social from "@/assets/social.jpg.asset.json";

export const services = [
  {
    slug: "website-design",
    title: { en: "Website Design", ar: "تصميم مواقع إلكترونية" },
    description: {
      en: "Viral Zoom plans and designs fast, responsive business websites with clear navigation, accessible layouts and content tailored to your customers. We work from your goals and brand identity through launch, helping Egyptian and Arab businesses turn visits into enquiries.",
      ar: "تصمم فايرال زوم مواقع شركات سريعة ومتوافقة مع الجوال، بهيكل واضح ومحتوى يناسب جمهورك. نبدأ من أهداف نشاطك وهويته ونرافقك حتى الإطلاق، لمساعدة الشركات في مصر والمنطقة العربية على تحويل الزيارات إلى استفسارات.",
    },
    image: website.url,
  },
  {
    slug: "ecommerce-development",
    title: { en: "E-commerce Development", ar: "تطوير المتاجر الإلكترونية" },
    description: {
      en: "We build online stores with mobile-first product pages, straightforward browsing and a checkout flow designed around your catalogue and operations. From store structure to launch, we help businesses in Egypt and the Arab region sell online with a consistent brand experience.",
      ar: "نطور متاجر إلكترونية بصفحات منتجات مناسبة للموبايل وتصفح واضح وخطوات شراء مبنية على طبيعة منتجاتك وتشغيلك. من تنظيم المتجر إلى إطلاقه، نساعد الشركات في مصر والمنطقة العربية على البيع أونلاين بتجربة متناسقة مع علامتها.",
    },
    image: website.url,
  },
  {
    slug: "digital-marketing",
    title: { en: "Digital Marketing", ar: "التسويق الرقمي" },
    description: {
      en: "Our digital marketing service connects content, social media, search and paid campaigns to business goals. We plan audience-focused activity, create useful brand content and use campaign reporting to identify what to improve for Egyptian, Saudi and wider Gulf audiences.",
      ar: "نربط في خدمة التسويق الرقمي بين المحتوى والسوشيال ميديا والبحث والإعلانات المدفوعة وبين أهداف النشاط التجاري. نخطط لحملات تناسب الجمهور وننتج محتوى مفيدًا ونتابع النتائج لتحسينها في مصر والسعودية وأسواق الخليج.",
    },
    image: social.url,
  },
  {
    slug: "software-development",
    title: { en: "Software Development", ar: "تطوير البرمجيات" },
    description: {
      en: "We design and develop custom web platforms and business software around real workflows, user needs and integration requirements. Viral Zoom supports teams from requirements and interface planning through implementation and launch for projects in Egypt and the Arab region.",
      ar: "نصمم ونطور منصات ويب وبرمجيات أعمال مخصصة حسب سير العمل واحتياجات المستخدم ومتطلبات التكامل. تدعم فايرال زوم الفرق من تحديد المتطلبات وتخطيط الواجهات إلى التنفيذ والإطلاق للمشروعات في مصر والمنطقة العربية.",
    },
    image: animation.url,
  },
  {
    slug: "printing",
    title: { en: "Printing", ar: "الطباعة" },
    description: {
      en: "We offer premium printing services that bring your marketing materials to life with unmatched quality. From stunning brochures and posters to custom business cards and promotional products, our advanced printing techniques ensure vibrant, sharp, and professional results. We understand the power of well-crafted print to leave a lasting impression, and our team is committed to delivering materials that enhance your brand\u2019s presence. Whether you're looking to captivate clients or boost brand awareness, our printing solutions are designed to make your message stand out.",
      ar: "نقدم خدمات طباعة عالية الجودة تمنح موادك التسويقية حضورًا مميزًا. من البروشورات والبوسترات إلى كروت الأعمال والمنتجات الدعائية، نهتم بكل تفصيلة لتصل رسالة علامتك التجارية بأفضل صورة.",
    },
    image: printing.url,
  },
  {
    slug: "seo",
    title: { en: "SEO", ar: "تحسين محركات البحث" },
    description: {
      en: "We specialize in expert SEO services designed to improve your website\u2019s visibility and drive organic traffic. Our tailored strategies focus on optimizing your content, enhancing site performance, and building quality backlinks to help you rank higher on search engines. With our data-driven approach, we ensure your brand reaches the right audience at the right time. From keyword research to on-page optimization, our SEO solutions are crafted to deliver long-term results and boost your online presence, helping you stay ahead of the competition and grow your business.",
      ar: "نساعد موقعك على الظهور أمام الجمهور المناسب وزيادة الزيارات الطبيعية. نعمل على تحسين المحتوى وأداء الموقع، ودراسة الكلمات المفتاحية وبناء روابط قوية لتحقيق نتائج مستدامة.",
    },
    image: seo.url,
  },
  {
    slug: "events-management",
    title: { en: "Events Management", ar: "إدارة الفعاليات" },
    description: {
      en: "We offer expert event management services that turn your vision into a seamless, unforgettable experience. Whether it\u2019s a corporate conference, product launch, or private celebration, our team handles every detail\u2014planning, logistics, coordination, and execution\u2014ensuring flawless events from start to finish. We focus on creating engaging, memorable experiences that align with your brand\u2019s goals and leave a lasting impact on your audience. Let us take care of the details so you can focus on what matters most: connecting with your guests and achieving your event objectives.",
      ar: "نحوّل رؤيتك إلى تجربة متكاملة لا تُنسى. من المؤتمرات وإطلاق المنتجات إلى المناسبات الخاصة، نتولى التخطيط والتنظيم والتنسيق والتنفيذ، لتتفرغ للتواصل مع ضيوفك.",
    },
    image: events.url,
  },
  {
    slug: "animation-video",
    title: { en: "Animation Video", ar: "فيديوهات الأنيميشن" },
    description: {
      en: "We create captivating animation videos that bring your ideas to life in a visually engaging way. From explainer videos to promotional animations, our team blends creativity with storytelling to produce content that resonates with your audience. With dynamic visuals and compelling narratives, we craft animations that simplify complex messages and capture attention. Whether for social media, websites, or advertisements, our animation videos are designed to elevate your brand, boost engagement, and leave a lasting impression.",
      ar: "نحوّل أفكارك إلى فيديوهات أنيميشن جذابة تجمع الإبداع بالحكاية. نصنع فيديوهات توضيحية وإعلانية تبسّط الرسائل وتلفت الأنظار وتعزز تفاعل جمهورك مع علامتك التجارية.",
    },
    image: animation.url,
  },
  {
    slug: "website-creation",
    title: { en: "Website Creation", ar: "تصميم المواقع" },
    description: {
      en: "We specialize in creating stunning, user-friendly websites that not only look great but also drive results. Our team of designers and developers work closely with you to build a customized website that reflects your brand\u2019s identity and meets your business goals. From responsive design to seamless functionality, we ensure your site provides an exceptional user experience across all devices. Whether you're looking for an e-commerce platform, a portfolio, or a corporate site, we deliver websites that engage visitors and convert them into loyal customers.",
      ar: "نصمم مواقع عصرية وسهلة الاستخدام تعكس هوية علامتك وتحقق أهدافك. من المتاجر الإلكترونية إلى مواقع الشركات ومعارض الأعمال، نقدم تجربة متكاملة على جميع الأجهزة.",
    },
    image: website.url,
  },
  {
    slug: "video-production",
    title: { en: "Video Production", ar: "إنتاج الفيديو" },
    description: {
      en: "We turn ideas into video content that reflects your brand and connects with your audience.",
      ar: "نحول الأفكار إلى محتوى فيديو يعكس هوية علامتك التجارية ويصل إلى جمهورك.",
    },
    image: video.url,
  },
  {
    slug: "social-media-management",
    title: { en: "Social Media Management", ar: "إدارة السوشيال ميديا" },
    description: {
      en: "We provide expert social media management to help your brand thrive in today\u2019s digital world. Our team creates tailored strategies that drive engagement, build community, and boost brand visibility across platforms like Instagram, Facebook, LinkedIn, and more. From content creation and scheduling to community management and analytics, we handle every aspect of your social media presence. With a data-driven approach and creative expertise, we ensure your brand stays relevant, connects with the right audience, and achieves measurable results.",
      ar: "نضع استراتيجيات مخصصة لحضور علامتك على إنستجرام وفيسبوك ولينكدإن وغيرها. من صناعة المحتوى وجدولته إلى إدارة المجتمع وتحليل النتائج، نهتم بكل تفاصيل حضورك الرقمي.",
    },
    image: social.url,
  },
  {
    slug: "offline-marketing",
    title: { en: "Offline Marketing", ar: "التسويق الميداني" },
    description: {
      en: "We believe in the power of offline marketing to create lasting, personal connections with your audience. From print advertisements and direct mail campaigns to event marketing and experiential activations, our team develops strategies that engage customers in the real world. We craft meaningful, memorable experiences that drive brand awareness and loyalty. By combining creative design with strategic planning, we help you reach your target audience through impactful, offline channels that complement your digital efforts and leave a tangible impression.",
      ar: "نصنع تواصلًا حقيقيًا مع جمهورك من خلال الإعلانات المطبوعة والفعاليات والتجارب الميدانية. نمزج التخطيط والإبداع لنقدم حملات ملموسة تدعم حضورك الرقمي وتبني ولاء العملاء.",
    },
    image: printing.url,
  },
  {
    slug: "google-ads",
    title: { en: "Google Ads", ar: "إعلانات جوجل" },
    description: {
      en: "We specialize in Google Ads campaigns that drive targeted traffic and generate measurable results. Our team optimizes every aspect of your campaign\u2014from keyword research and ad creation to bid management and performance tracking. With a focus on maximizing ROI, we ensure your ads reach the right audience at the right time, whether you\u2019re looking to increase website visits, drive conversions, or boost brand awareness. Let us help you leverage the power of Google Ads to grow your business and achieve your marketing goals.",
      ar: "نصمم حملات إعلانات جوجل التي تصل إلى الجمهور المناسب وتحقق نتائج قابلة للقياس. نهتم بالكلمات المفتاحية والإعلانات والميزانية ومتابعة الأداء لزيادة الزيارات والتحويلات.",
    },
    image: seo.url,
  },
  {
    slug: "games-development",
    title: { en: "Games Development", ar: "تطوير الألعاب" },
    description: {
      en: "We specialize in game development that blends creativity, technology, and innovation to deliver immersive and engaging experiences. Whether it's mobile games, interactive apps, or custom-branded games, our team of developers, designers, and storytellers work together to bring your vision to life. We focus on creating high-quality, visually captivating games that captivate your audience and keep them coming back for more. With a user-centric approach, we ensure each game is optimized for maximum engagement, providing both entertainment and value to your brand.",
      ar: "نمزج الإبداع والتكنولوجيا لصناعة ألعاب وتجارب تفاعلية ممتعة. نطور ألعاب الهاتف وتطبيقات تفاعلية وألعابًا مخصصة للعلامات التجارية، مع التركيز على جودة التصميم وتجربة المستخدم.",
    },
    image: animation.url,
  },
];
