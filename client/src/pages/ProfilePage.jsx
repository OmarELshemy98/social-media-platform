import { Card } from "react-bootstrap";
import { useSelector } from "react-redux";

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <Card className="dashboard-card">
      <Card.Body>
        <h4>{user?.name}</h4>
        <p className="mb-1">@{user?.username}</p>
        <p className="text-muted mb-0">{user?.bio || "No bio added yet."}</p>
      </Card.Body>
    </Card>
  );
};

export default ProfilePage;
