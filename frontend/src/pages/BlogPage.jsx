import axios from "axios"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useParams } from "react-router-dom"

function BlogPage() {
  const [blogData,setBlogData] = useState(null)
  const {id} = useParams()
  
    async function fetchBlogById(){
      try {
         let res = await axios.get(`http://localhost:3000/api/v1/blogs/${id}`)
         console.log(res)
         setBlogData(res.data.blog)
      } catch (error) {
        toast.error(error)
      }
    }
  
 useEffect(()=>{
  fetchBlogById()
 },[])
  return <div>{blogData ? <div><h1>{blogData.title}</h1>
    <h3>{blogData.creator.name}</h3>
    <img src={blogData.image} alt="" />
  </div> : <h1>Loading</h1> }</div>
}

export default BlogPage