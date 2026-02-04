import { MyResolver } from "../config/Resolver"
import { ROOT_NODE, hash } from "../ens/SetRecord";


const Home = () => {
    const resolver = MyResolver();
  return (
    <div>
        {resolver}
        {hash}
        
        {ROOT_NODE}
    </div>
  )
}

export default Home