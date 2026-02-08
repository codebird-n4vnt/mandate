import { ConnectButton } from '@rainbow-me/rainbowkit';

export const Navbar = () => {
  return (
    <nav className="w-full border-b-2 border-border bg-background">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6 lg:px-12">
        
        <div className="flex items-center">
          <span className="font-display text-4xl font-black tracking-tighter uppercase italic">
            Mandate
          </span>
        </div>

        {/* Right Side: Wallet Connect */}
        <div className="flex items-center gap-8">     
          {/* <ConnectButton/> */}
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
                  })}
                  className="flex items-center gap-0" // Gap 0 because we use borders to separate
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <button
                          onClick={openConnectModal}
                          type="button"
                          className="h-12 border-2 border-black bg-black px-8 font-mono text-sm font-bold tracking-widest text-white transition-all duration-100 hover:bg-white hover:text-black focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-black"
                        >
                          CONNECT WALLET
                        </button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <button
                          onClick={openChainModal}
                          type="button"
                          className="h-12 border-2 border-black bg-white px-6 font-mono text-xs font-bold text-black hover:bg-black hover:text-white"
                        >
                          WRONG NETWORK
                        </button>
                      );
                    }

                    return (
                      <div className="flex items-center border-2 border-black">
                        {/* Network Switcher Button */}
                        <button
                          onClick={openChainModal}
                          className="flex h-12 items-center gap-2 border-r-2 border-black px-4 font-mono text-xs font-bold transition-colors hover:bg-black hover:text-white"
                          type="button"
                        >
                          {chain.hasIcon && (
                            <div className="h-4 w-4 grayscale invert group-hover:invert-0">
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? 'Chain icon'}
                                  src={chain.iconUrl}
                                  style={{ width: 16, height: 16 }}
                                />
                              )}
                            </div>
                          )}
                          <span className="uppercase tracking-tight">{chain.name}</span>
                        </button>

                        {/* Account Button */}
                        <button
                          onClick={openAccountModal}
                          type="button"
                          className="h-12 px-6 font-mono text-xs font-bold transition-colors hover:bg-black hover:text-white"
                        >
                          {account.displayName}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </nav>
  );
};
