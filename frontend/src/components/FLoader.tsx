import { HashLoader } from "react-spinners"


const FLoader = () => {
  return (
    <div className=" h-screen w-screen flex justify-center items-center fixed bg-[rgb(137,144,142,0.74)] z-10 ">
      <span className=""><HashLoader color="#000000" /></span>
    </div>
  )
}

export default FLoader
