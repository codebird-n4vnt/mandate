
import { useConnect, useConnection, useConnectors } from "wagmi"



const Wallet = () => {
const connect = useConnect();
const connectors = useConnectors()
const connection = useConnection();

  return (
    <div>
        {connection.isDisconnected&&connectors.map(connector=>(
            <button key={connector.id} onClick={()=>connect.mutate({connector})}>
                {connector.name}
            </button>
        ))}

        {connection.address}
    </div>
  )
}

export default Wallet