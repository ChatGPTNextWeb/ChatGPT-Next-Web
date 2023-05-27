import { UserProfile } from "@clerk/nextjs";
import "./styles.scss";

const UserProfilePage = () => {
  return (
    <div className={"container"}>
      <UserProfile path="/account" routing="path" />
    </div>
  );
};

export default UserProfilePage;
