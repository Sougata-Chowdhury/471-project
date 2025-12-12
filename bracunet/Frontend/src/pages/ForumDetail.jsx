// import React, { useEffect, useState, useContext } from "react";
// import { useParams } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";
// import {
//   getGroupPosts,
//   createPost,
//   getPostComments,
//   addComment,
//   upvotePost,
//   upvoteComment,
// } from "../api";

// const ForumDetail = () => {
//   const { forumId } = useParams();
//   const { user } = useContext(AuthContext);
//   const [posts, setPosts] = useState([]);
//   const [newPost, setNewPost] = useState("");
//   const [comments, setComments] = useState({}); // { postId: [comments] }
//   const [commentInput, setCommentInput] = useState({}); // { postId: text }

//   useEffect(() => {
//     fetchPosts();
//   }, [forumId]);

//   const fetchPosts = async () => {
//     try {
//       const res = await getGroupPosts(forumId);
//       setPosts(res.data);

//       // Fetch comments for each post
//       res.data.forEach(async (post) => {
//         const commentsRes = await getPostComments(post._id);
//         setComments((prev) => ({ ...prev, [post._id]: commentsRes.data }));
//       });
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handlePostSubmit = async () => {
//     if (!newPost.trim()) return;
//     try {
//       await createPost({ groupId: forumId, content: newPost });
//       setNewPost("");
//       fetchPosts();
//     } catch (err) {
//       console.error(err);
//       alert("Failed to create post");
//     }
//   };

//   const handleCommentSubmit = async (postId) => {
//     const content = commentInput[postId];
//     if (!content?.trim()) return;

//     try {
//       await addComment({ postId, content });
//       setCommentInput((prev) => ({ ...prev, [postId]: "" }));
//       fetchPosts();
//     } catch (err) {
//       console.error(err);
//       alert("Failed to add comment");
//     }
//   };

//   const handleUpvotePost = async (postId) => {
//     try {
//       await upvotePost(postId);
//       fetchPosts();
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleUpvoteComment = async (commentId) => {
//     try {
//       await upvoteComment(commentId);
//       fetchPosts();
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
//       <h1 className="text-3xl font-bold text-gray-800 mb-6">Group Forum</h1>

//       {/* New Post */}
//       <div className="mb-6">
//         <textarea
//           className="w-full border rounded p-3"
//           rows={3}
//           placeholder="Write a new post..."
//           value={newPost}
//           onChange={(e) => setNewPost(e.target.value)}
//         />
//         <button
//           className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
//           onClick={handlePostSubmit}
//         >
//           Post
//         </button>
//       </div>

//       {/* Posts List */}
//       <div className="space-y-6">
//         {posts.map((post) => (
//           <div key={post._id} className="bg-white p-4 rounded shadow">
//             <div className="flex justify-between items-center mb-2">
//               <h3 className="font-bold">{post.author.name}</h3>
//               <button
//                 className="text-blue-500"
//                 onClick={() => handleUpvotePost(post._id)}
//               >
//                 👍 {post.upvotes || 0}
//               </button>
//             </div>
//             <p className="text-gray-700">{post.content}</p>

//             {/* Comments */}
//             <div className="mt-3 ml-4">
//               {(comments[post._id] || []).map((comment) => (
//                 <div
//                   key={comment._id}
//                   className="flex justify-between items-center mb-1"
//                 >
//                   <p className="text-gray-600">
//                     <span className="font-semibold">{comment.author.name}:</span> {comment.content}
//                   </p>
//                   <button
//                     className="text-blue-500"
//                     onClick={() => handleUpvoteComment(comment._id)}
//                   >
//                     👍 {comment.upvotes || 0}
//                   </button>
//                 </div>
//               ))}

//               {/* Add Comment */}
//               <div className="mt-2 flex gap-2">
//                 <input
//                   type="text"
//                   className="border rounded p-2 flex-1"
//                   placeholder="Add a comment..."
//                   value={commentInput[post._id] || ""}
//                   onChange={(e) =>
//                     setCommentInput((prev) => ({ ...prev, [post._id]: e.target.value }))
//                   }
//                 />
//                 <button
//                   className="bg-green-500 hover:bg-green-600 text-white px-3 rounded"
//                   onClick={() => handleCommentSubmit(post._id)}
//                 >
//                   Comment
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ForumDetail;




import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  getGroupPosts,
  createPost,
  getPostComments,
  addComment,
  reactPost,
} from "../api/forum"; // নিশ্চিত করো path ঠিক আছে

const ForumDetail = () => {
  const { forumId } = useParams();
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [comments, setComments] = useState({}); // { postId: [comments] }
  const [commentInput, setCommentInput] = useState({}); // { postId: text }

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line
  }, [forumId]);

  const fetchPosts = async () => {
    try {
      const res = await getGroupPosts(forumId);
      const postsData = res.data.posts || []; // backend থেকে আসা posts array
      setPosts(postsData);

      // Fetch comments for each post
      postsData.forEach(async (post) => {
        const commentsRes = await getPostComments(post._id);
        const commentsData = commentsRes.data.comments || [];
        setComments((prev) => ({ ...prev, [post._id]: commentsData }));
      });
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  };

  const handlePostSubmit = async () => {
    if (!newPost.trim()) return;
    try {
      await createPost(forumId, { content: newPost }); // backend expects groupId in URL
      setNewPost("");
      fetchPosts();
    } catch (err) {
      console.error("Failed to create post:", err);
      alert("Failed to create post");
    }
  };

  const handleCommentSubmit = async (postId) => {
    const content = commentInput[postId];
    if (!content?.trim()) return;

    try {
      await addComment(postId, { content });
      setCommentInput((prev) => ({ ...prev, [postId]: "" }));
      fetchPosts();
    } catch (err) {
      console.error("Failed to add comment:", err);
      alert("Failed to add comment");
    }
  };

  const handleReactPost = async (postId) => {
    try {
      await reactPost(postId);
      fetchPosts();
    } catch (err) {
      console.error("Failed to react to post:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Group Forum</h1>

      {/* New Post */}
      <div className="mb-6">
        <textarea
          className="w-full border rounded p-3"
          rows={3}
          placeholder="Write a new post..."
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        />
        <button
          className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handlePostSubmit}
        >
          Post
        </button>
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post._id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">{post.author.name}</h3>
              <button
                className="text-blue-500"
                onClick={() => handleReactPost(post._id)}
              >
                👍 {post.upvotes || 0}
              </button>
            </div>
            <p className="text-gray-700">{post.content}</p>

            {/* Comments */}
            <div className="mt-3 ml-4">
              {(comments[post._id] || []).map((comment) => (
                <div
                  key={comment._id}
                  className="flex justify-between items-center mb-1"
                >
                  <p className="text-gray-600">
                    <span className="font-semibold">{comment.author.name}:</span> {comment.content}
                  </p>
                  <button
                    className="text-blue-500"
                    onClick={() => handleReactPost(comment._id)} // যদি comment react আলাদা API হয়, পরিবর্তন করো
                  >
                    👍 {comment.upvotes || 0}
                  </button>
                </div>
              ))}

              {/* Add Comment */}
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  className="border rounded p-2 flex-1"
                  placeholder="Add a comment..."
                  value={commentInput[post._id] || ""}
                  onChange={(e) =>
                    setCommentInput((prev) => ({ ...prev, [post._id]: e.target.value }))
                  }
                />
                <button
                  className="bg-green-500 hover:bg-green-600 text-white px-3 rounded"
                  onClick={() => handleCommentSubmit(post._id)}
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForumDetail;
