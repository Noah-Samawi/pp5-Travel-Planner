import React from "react";
import { useCurrentUser } from "../../contexts/CurrentUserContext";
import { Link, useNavigate } from "react-router-dom"; 
import styles from "../../styles/Post.module.css";
import counterStyles from "../../styles/Counter.module.css";

import Card from "react-bootstrap/Card";
import Media from "react-bootstrap/Media";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Avatar from "../../components/Avatar";
import { axiosReq, axiosRes } from "../../api/axiosDefaults";
import { MoreDropdown } from "../../components/MoreDropdown";

const Post = (props) => {
  const {
    id,
    owner,
    wanderer_id,
    wanderer_image,
    comments_count,
    likes_count,
    like_id,
    bucketlists_count,
    bucketlist_id,
    title,
    content,
    truncated,
    image,
    updated_at,
    postPage,
    setPosts,
    location,
    country,
  } = props;

  const currentUser = useCurrentUser();
  const is_owner = currentUser?.username === owner;
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/posts/${id}/edit`);
  };

  const handleDelete = async () => {
    try {
      await axiosRes.delete(`/posts/${id}/`);
      navigate(`/`, { message: 'Your memory was successfully deleted.' });
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const handleLike = async () => {
    try {
      const { data } = await axiosReq.post("/likes/", { post: id });
      setPosts((prevPosts) => ({
        ...prevPosts,
        results: prevPosts.results.map((post) => 
          post.id === id ? { ...post, likes_count: post.likes_count + 1, like_id: data.id } : post
        ),
      }));
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleBucketlist = async () => {
    try {
      const { data } = await axiosReq.post("/bucketlist/", { post: id });
      setPosts((prevPosts) => ({
        ...prevPosts,
        results: prevPosts.results.map((post) => 
          post.id === id 
            ? { ...post, bucketlists_count: post.bucketlists_count + 1, bucketlist_id: data.id } 
            : post
        ),
      }));
    } catch (err) {
      console.error("Error adding to bucketlist:", err);
    }
  };

  const handleUnlike = async () => {
    try {
      await axiosReq.delete(`/likes/${like_id}/`);
      setPosts((prevPosts) => ({
        ...prevPosts,
        results: prevPosts.results.map((post) => 
          post.id === id ? { ...post, likes_count: post.likes_count - 1, like_id: null } : post
        ),
      }));
    } catch (err) {
      console.error("Error unliking post:", err);
    }
  };

  const handleRemoveFromBucketlist = async () => {
    try {
      await axiosReq.delete(`/bucketlist/${bucketlist_id}/`);
      setPosts((prevPosts) => ({
        ...prevPosts,
        results: prevPosts.results.map((post) => 
          post.id === id 
            ? { ...post, bucketlists_count: post.bucketlists_count - 1, bucketlist_id: null } 
            : post
        ),
      }));
    } catch (err) {
      console.error("Error removing from bucketlist:", err);
    }
  };

  return (
    <Card className={styles.Post}>
      <Card.Body>
        <Media className="d-flex align-items-center justify-content-between">
          <Link to={`/wanderers/${wanderer_id}`}>
            <Avatar src={wanderer_image} height={55} />
            {owner}
          </Link>
          <div className="d-flex align-items-center">
            <span className={styles.smallText}>{updated_at}</span>
            {is_owner && postPage && (
              <MoreDropdown
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
            )}
          </div>
        </Media>
      </Card.Body>
      <Link to={`/posts/${id}`}>
        <Card.Img src={image} alt={title} />
      </Link>
      <Card.Body>
        {title && (
          <Card.Title className={`text-center ${styles.TitleText}`}>
            {title}
          </Card.Title>
        )}
        {truncated && content && (
          <Card.Text>{content.substring(0, 200)} ...</Card.Text>
        )}
        {!truncated && content && <Card.Text>{content}</Card.Text>}

        <div className={styles.PostBar}>
          {is_owner ? (
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>You can't like your own post!</Tooltip>}
            >
              <i className="far fa-heart" />
            </OverlayTrigger>
          ) : like_id ? (
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>No more love!</Tooltip>}
            >
              <div>
                <span onClick={handleUnlike}>
                  <i className={`fas fa-heart ${styles.Heart}`} />
                </span>
              </div>
            </OverlayTrigger>
          ) : currentUser ? (
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Love it!</Tooltip>}
            >
              <div>
                <span onClick={handleLike}>
                  <i className={`far fa-heart ${styles.HeartOutline}`} />
                </span>
              </div>
            </OverlayTrigger>
          ) : (
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Log in to like posts!</Tooltip>}
            >
              <i className="far fa-heart" />
            </OverlayTrigger>
          )}
          <span className={counterStyles.counter}>{likes_count}</span>
          <OverlayTrigger
              placement="top"
              overlay={<Tooltip>See Comments!</Tooltip>}
            >
          <Link to={`/posts/${id}`}>
            <i className="far fa-comments" />
          </Link>
          </OverlayTrigger>
          <span className={counterStyles.counter}>{comments_count}</span>
          {bucketlist_id ? (
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Remove from bucketlist!</Tooltip>}
            >
              <div>
                <span onClick={handleRemoveFromBucketlist}>
                  <i className={`fa-solid fa-bucket ${styles.Heart}`} />
                </span>
              </div>
            </OverlayTrigger>
          ) : (
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Add to bucketlist!</Tooltip>}
            >
              <div>
                <span onClick={handleBucketlist}>
                  <i className={`fa-solid fa-bucket ${styles.HeartOutline}`} />
                </span>
              </div>
            </OverlayTrigger>
          )}
          <span className={counterStyles.counter}>{bucketlists_count}</span>
        </div>
        <hr />
        <div className="d-flex align-items-center justify-content-end">
          <span className={styles.smallText}>
            With love from {location} in {country}
          </span>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Post;
