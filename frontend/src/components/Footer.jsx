// src/components/Footer.jsx
const Footer = ({ variant = "light" }) => {
  const textColor = variant === "dark" ? "text-green-100" : "text-gray-600";
  const bgColor = variant === "dark" ? "bg-transparent" : "bg-white";
  
  return (
    <footer className={`${bgColor} border-t border-gray-200 py-4 px-8 mt-auto`}>
      <div className="text-center">
        <p className={`${textColor} text-sm`}>
          Developed by IJ ~ Damina - © 2025 Nigeria Immigration Service.
        </p>
      </div>
    </footer>
  );
};

export default Footer;