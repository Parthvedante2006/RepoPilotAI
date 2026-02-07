import { useEffect } from "react";

export default function LanguageSwitcher() {
  useEffect(() => {
    if (document.getElementById("google-translate-script")) return;

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,hi,mr,ta,te,ml,sa,pa", // English, Hindi, Marathi
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="flex items-center gap-3">
      {/* Label */}
      <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
    
      </span>

      {/* Dropdown container */}
      <div
        id="google_translate_element"
        className="
          [&_.goog-logo-link]:hidden
          [&_span]:hidden
          [&_select]:bg-indigo-50
          [&_select]:text-indigo-800
          [&_select]:border
          [&_select]:border-indigo-500
          [&_select]:rounded-lg
          [&_select]:px-3
          [&_select]:py-1.5
          [&_select]:text-sm
          [&_select]:font-semibold
          [&_select]:cursor-pointer
          [&_select]:outline-none
          [&_select:hover]:bg-indigo-100
          [&_select:focus]:ring-2
          [&_select:focus]:ring-indigo-400
          dark:[&_select]:bg-gray-800
          dark:[&_select]:text-gray-100
          dark:[&_select]:border-indigo-400
        "
      />
    </div>
  );
}


