import React from "react";
import { Link } from "react-router-dom";

export function NavItem({ label, link, Icon, onClick }) {
  const isAction = !link || link === "#";

  const content = (
    <>
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </>
  );

  const className =
    "flex items-center gap-3 w-full py-2 text-gray-400 hover:text-[#41FFEE] transition duration-300";

  if (isAction) {
    return (
      <li>
        <button type="button" className={className} onClick={onClick}>
          {content}
        </button>
      </li>
    );
  }

  return (
    <li>
      <Link to={link} className={className} onClick={onClick}>
        {content}
      </Link>
    </li>
  );
}
