import { useEffect, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchProfileByUsername, updateMyProfile } from "../features/profile/profileSlice";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { username } = useParams();
  const { user } = useSelector((state) => state.auth);
  const { profileUser, profilePosts } = useSelector((state) => state.profile);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "", avatarUrl: "" });

  const targetUsername = username || user?.username;
  const isOwner = targetUsername === user?.username;

  useEffect(() => {
    if (targetUsername) dispatch(fetchProfileByUsername(targetUsername));
  }, [dispatch, targetUsername]);

  return (
    <>
      <Card className="dashboard-card mb-3">
        <Card.Body>
          <div className="d-flex justify-content-between">
            <div>
              <h4>{profileUser?.name}</h4>
              <p className="mb-1">@{profileUser?.username}</p>
              <p className="text-muted mb-0">{profileUser?.bio || "No bio added yet."}</p>
            </div>
            {isOwner && (
              <Button
                variant="outline-primary"
                onClick={() => {
                  if (!editing && profileUser) {
                    setForm({
                      name: profileUser.name || "",
                      bio: profileUser.bio || "",
                      avatarUrl: profileUser.avatarUrl || "",
                    });
                  }
                  setEditing((prev) => !prev);
                }}
              >
                {editing ? "Cancel" : "Edit"}
              </Button>
            )}
          </div>
          {isOwner && editing && (
            <Form
              className="mt-3"
              onSubmit={(e) => {
                e.preventDefault();
                dispatch(updateMyProfile(form)).then(() => {
                  setEditing(false);
                  dispatch(fetchProfileByUsername(targetUsername));
                });
              }}
            >
              <Form.Control
                className="mb-2"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Name"
              />
              <Form.Control
                className="mb-2"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Bio"
              />
              <Form.Control
                className="mb-2"
                value={form.avatarUrl}
                onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                placeholder="Avatar URL"
              />
              <Button type="submit">Save Changes</Button>
            </Form>
          )}
        </Card.Body>
      </Card>

      <Card className="dashboard-card">
        <Card.Body>
          <h5>Posts History</h5>
          {profilePosts.map((post) => (
            <div key={post._id} className="border-top py-2">
              {post.content}
            </div>
          ))}
        </Card.Body>
      </Card>
    </>
  );
};

export default ProfilePage;
