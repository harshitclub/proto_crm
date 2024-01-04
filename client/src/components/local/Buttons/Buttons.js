import { RiLogoutBoxFill } from "react-icons/ri";
import "./style.css";

export const LogoutBtn = () => {
  return (
    <button className="logoutBtn">
      <RiLogoutBoxFill style={{ marginBottom: "-2px" }} /> Logout
    </button>
  );
};
