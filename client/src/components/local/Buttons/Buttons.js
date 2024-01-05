import { RiArrowRightSLine, RiEye2Line, RiLogoutBoxFill } from "react-icons/ri";
import "./style.css";

export const LogoutBtn = () => {
  return (
    <button className="logoutBtn">
      <RiLogoutBoxFill style={{ marginBottom: "-2px" }} /> Logout
    </button>
  );
};

export const CommonBtn = ({ text, link }) => {
  return (
    <a href={link}>
      <p className="commonBtn">
        {text} <RiArrowRightSLine style={{ marginBottom: "-3px" }} />
      </p>
    </a>
  );
};

export const DeleteBtn = ({ text, passFunction }) => {
  return (
    <button onClick={passFunction} className="deleteBtn">
      {text}
    </button>
  );
};

export const EditBtn = ({ text, passFunction }) => {
  return (
    <button onClick={passFunction} className="editBtn">
      {text}
    </button>
  );
};

export const ViewProfile = ({ text, passFunction }) => {
  return (
    <button onClick={passFunction} className="editBtn">
      {text} <RiEye2Line style={{ marginBottom: "-3px" }} />
    </button>
  );
};
