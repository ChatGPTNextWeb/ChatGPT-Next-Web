import { UserProfile } from "@clerk/nextjs";
import "./styles.scss";

const UserProfilePage = () => {
  return (
    <div className={"container"}>
      <UserProfile path="/profile" routing="path" />
    </div>
  );
};

export default UserProfilePage;
