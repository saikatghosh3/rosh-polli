import Link from "next/link";
import { Accordion, AccordionItem } from "@/components/ui/accordion";

const faqs = [
  {
    question: "কিভাবে অর্ডার করব?",
    answer: "আপনার পছন্দের পণ্য কার্টে যোগ করুন, তারপর চেকআউট পৃষ্ঠায় যেয়ে আপনার তথ্য দিয়ে অর্ডার সম্পন্ন করুন।",
  },
  {
    question: "ডেলিভারি কত সময় নেয়?",
    answer: "সাধারণত অর্ডার সম্পন্ন হওয়ার পর ৩-৭ কর্মদিবসের মধ্যে ডেলিভারি হয়।",
  },
  {
    question: "রিটার্ন ও রিফান্ড কেমন?",
    answer: "প্রতিটি পণ্য ক্রয়ের ৭ দিনের মধ্যে রিটার্ন করা যায়। প্রয়োজনে পূর্ণ রিফান্ড দেওয়া হয়।",
  },
  {
    question: "ক্যাশ অন ডেলিভারি সম্ভব?",
    answer: "হ্যাঁ, বাংলাদেশের যেকোনো স্থানে ক্যাশ অন ডেলিভারি সুবিধা রয়েছে।",
  },
  {
    question: "নির্দিষ্ট পণ্য কেন পাওয়া যাচ্ছে না?",
    answer: "কেজুর গুর ও রস মৌসুমভেদে তৈরি হয়। স্টক শেষ হলে পরবর্তী ব্যাচে পুনরায় পাওয়া যাবে।",
  },
];

export const metadata = {
  title: "প্রশ্নোত্তর | রসপল্লী",
  description: "রসপল্লী-র সংক্রান্ত প্রশ্নোত্তর। ডেলিভারি, রিটার্ন, মৌসুম ও পেমেন্ট সংক্রান্ত সাধারণ প্রশ্ন।",
};

export default function FAQPage() {
  return (
    <section className="page-shell site-container">
      <div className="page-title-block"><span className="eyebrow">সাহায্য কেন্দ্র</span><h1>প্রশ্নোত্তর</h1><p>আপনার প্রশ্নের উত্তর এখানে খুঁজে পান।</p></div>
      <div className="faq-list">
        {faqs.map((item, index) => (
          <AccordionItem key={item.question} index={index} question={item.question} answer={item.answer} />
        ))}
      </div>
      <div className="faq-cta"><p>আরও প্রশ্ন আছে?</p><Link className="button button--dark" href="/contact">যোগাযোগ করুন</Link></div>
    </section>
  );
}