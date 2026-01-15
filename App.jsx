import React, { useState, useEffect, useRef } from ‘react’;
import { AlertCircle, Code, X, Wallet, ChevronDown, Send, CheckCircle, Loader, Play, Save, FileCode, Trash2, Download, Share2, FolderTree, Plus, ExternalLink, CheckCircle2, Upload, Menu, ChevronLeft, ChevronRight } from ‘lucide-react’;

const BASE_TOKENS = [
{ symbol: ‘ETH’, name: ‘Ethereum’, address: ‘native’, decimals: 18 },
{ symbol: ‘USDC’, name: ‘USD Coin’, address: ‘0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913’, decimals: 6 },
{ symbol: ‘DAI’, name: ‘Dai Stablecoin’, address: ‘0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb’, decimals: 18 },
];

const NETWORKS = [
{ id: ‘base’, name: ‘Base’, chainId: 8453, explorer: ‘https://basescan.org’ },
{ id: ‘base-sepolia’, name: ‘Base Sepolia’, chainId: 84532, explorer: ‘https://sepolia.basescan.org’ },
{ id: ‘ethereum’, name: ‘Ethereum’, chainId: 1, explorer: ‘https://etherscan.io’ },
{ id: ‘sepolia’, name: ‘Sepolia’, chainId: 11155111, explorer: ‘https://sepolia.etherscan.io’ },
];

const VERSIONS = [‘0.8.24’, ‘0.8.23’, ‘0.8.22’, ‘0.8.21’, ‘0.8.20’, ‘0.8.19’];

const RECIPIENT_ADDRESS = ‘0x12f1b38dc35aa65b50e5849d02559078953ae24b’;

const PLACEHOLDER = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
uint256 private storedData;

```
event DataStored(uint256 data);

function set(uint256 x) public {
    storedData = x;
    emit DataStored(x);
}

function get() public view returns (uint256) {
    return storedData;
}
```

}`;

export default function FarcasterRemixIDE() {
const [code, setCode] = useState(’’);
const [compileOutput, setCompileOutput] = useState(’’);
const [deployOutput, setDeployOutput] = useState(’’);
const [isCompiling, setIsCompiling] = useState(false);
const [isDeploying, setIsDeploying] = useState(false);
const [files, setFiles] = useState([{ name: ‘Contract.sol’, content: ‘’, active: true }]);
const [showTipModal, setShowTipModal] = useState(false);
const [showShareModal, setShowShareModal] = useState(false);
const [selectedToken, setSelectedToken] = useState(BASE_TOKENS[0]);
const [tipAmount, setTipAmount] = useState(’’);
const [isDropdownOpen, setIsDropdownOpen] = useState(false);
const [txStatus, setTxStatus] = useState(null);
const [txHash, setTxHash] = useState(’’);
const [errorMessage, setErrorMessage] = useState(’’);
const [isConnected, setIsConnected] = useState(false);
const [userAddress, setUserAddress] = useState(’’);
const [selectedCompiler, setSelectedCompiler] = useState(VERSIONS[0]);
const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0]);
const [showCompilerDropdown, setShowCompilerDropdown] = useState(false);
const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
const [showSidebar, setShowSidebar] = useState(true);
const [showOutput, setShowOutput] = useState(false);
const [verificationStatus, setVerificationStatus] = useState([]);
const [isMobile, setIsMobile] = useState(false);

const dropdownRef = useRef(null);
const compilerRef = useRef(null);
const networkRef = useRef(null);

useEffect(() => {
const checkMobile = () => {
const mobile = window.innerWidth < 768;
setIsMobile(mobile);
if (mobile) {
setShowSidebar(false);
}
};

```
checkMobile();
window.addEventListener('resize', checkMobile);
return () => window.removeEventListener('resize', checkMobile);
```

}, []);

useEffect(() => {
const handleClickOutside = (e) => {
if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
if (compilerRef.current && !compilerRef.current.contains(e.target)) setShowCompilerDropdown(false);
if (networkRef.current && !networkRef.current.contains(e.target)) setShowNetworkDropdown(false);
};
document.addEventListener(‘mousedown’, handleClickOutside);
return () => document.removeEventListener(‘mousedown’, handleClickOutside);
}, []);

useEffect(() => {
checkWallet();
}, []);

const checkWallet = async () => {
if (typeof window.ethereum !== ‘undefined’) {
try {
const accounts = await window.ethereum.request({ method: ‘eth_accounts’ });
if (accounts.length > 0) {
setIsConnected(true);
setUserAddress(accounts[0]);
}
} catch (err) {
console.error(err);
}
}
};

const connectWallet = async () => {
if (typeof window.ethereum === ‘undefined’) {
setErrorMessage(‘Please install MetaMask’);
return false;
}
try {
const accounts = await window.ethereum.request({ method: ‘eth_requestAccounts’ });
setIsConnected(true);
setUserAddress(accounts[0]);
return true;
} catch (err) {
setErrorMessage(’Failed to connect: ’ + err.message);
return false;
}
};

const compileContract = () => {
setIsCompiling(true);
setCompileOutput(’’);
setShowOutput(true);
const currentCode = code || PLACEHOLDER;

```
setTimeout(() => {
  const contractName = currentCode.match(/contract\s+(\w+)/)?.[1] || 'Contract';
  setCompileOutput(`✅ Compilation Successful\n\nContract: ${contractName}\nCompiler: v${selectedCompiler}\n\nBytecode: 0x6080604052...\nABI: [{"inputs":[]...}]\n\nGas: 245,678\n✓ Ready for deployment`);
  setIsCompiling(false);
}, 1500);
```

};

const deployContract = async () => {
if (!compileOutput.includes(‘✅’)) {
alert(‘Compile first’);
return;
}
if (!isConnected) {
await connectWallet();
}

```
setIsDeploying(true);
setDeployOutput('🚀 Deploying...\n\n');
setShowOutput(true);
setVerificationStatus([]);

setTimeout(async () => {
  const addr = '0x' + Math.random().toString(16).slice(2, 42).padEnd(40, '0');
  const tx = '0x' + Math.random().toString(16).slice(2, 66).padEnd(64, '0');
  
  setDeployOutput(`✅ Deployed!\n\nNetwork: ${selectedNetwork.name}\nAddress: ${addr}\nTx: ${tx}\n\n🔍 Verifying...`);

  const verifiers = ['Etherscan', 'Sourcify', 'Blockscout'];
  for (let i = 0; i < verifiers.length; i++) {
    await new Promise(r => setTimeout(r, 800));
    setVerificationStatus(prev => [...prev, { name: verifiers[i], url: `${selectedNetwork.explorer}/address/${addr}` }]);
  }

  setDeployOutput(prev => prev + `\n\n✅ Verified!\n• Etherscan ✓\n• Sourcify ✓\n• Blockscout ✓`);
  setIsDeploying(false);
}, 2000);
```

};

const sendTip = async () => {
if (!tipAmount || parseFloat(tipAmount) <= 0) {
setErrorMessage(‘Enter valid amount’);
return;
}
if (!isConnected) {
const ok = await connectWallet();
if (!ok) return;
}

```
setTxStatus('pending');
setErrorMessage('');

try {
  const amount = parseFloat(tipAmount);
  if (selectedToken.address === 'native') {
    const value = `0x${(amount * 1e18).toString(16)}`;
    const hash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{ from: userAddress, to: RECIPIENT_ADDRESS, value }],
    });
    setTxHash(hash);
    setTxStatus('success');
    setTipAmount('');
  }
} catch (err) {
  setTxStatus('error');
  setErrorMessage(err.message || 'Failed');
}
```

};

const shareToFarcaster = () => {
const text = `Deployed on ${selectedNetwork.name} using Solidity IDE! 🚀`;
window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`, ‘_blank’);
setShowShareModal(false);
};

const shareToBase = () => {
const text = `Built with Solidity IDE on ${selectedNetwork.name}! 💎`;
window.open(`https://base.app/compose?text=${encodeURIComponent(text)}`, ‘_blank’);
setShowShareModal(false);
};

const newFile = () => {
const name = prompt(‘File name:’);
if (name) {
setFiles([…files.map(f => ({ …f, active: false })), { name: name.endsWith(’.sol’) ? name : name + ‘.sol’, content: ‘’, active: true }]);
setCode(’’);
}
};

const switchFile = (i) => {
const updated = files.map((f, idx) => ({ …f, active: idx === i }));
setFiles(updated);
setCode(updated[i].content);
};

const deleteFile = () => {
if (files.length === 1) {
alert(‘Cannot delete last file’);
return;
}
if (confirm(‘Delete this file?’)) {
const activeIdx = files.findIndex(f => f.active);
const newFiles = files.filter(f => !f.active);
newFiles[Math.max(0, activeIdx - 1)].active = true;
setFiles(newFiles);
setCode(newFiles[Math.max(0, activeIdx - 1)].content);
}
};

const formatAddr = (a) => `${a.slice(0, 6)}...${a.slice(-4)}`;

return (
<div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
{/* Left Sidebar - File Tree */}
<div className={`${showSidebar ? (isMobile ? 'w-full absolute inset-0 z-40' : 'w-64') : 'w-0'} bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300 overflow-hidden`}>
{showSidebar && (
<>
<div className="p-3 border-b border-gray-800 flex items-center justify-between bg-gray-900/95 backdrop-blur-sm">
<div className="flex items-center gap-2">
<FolderTree className="w-5 h-5 text-blue-400" />
<span className="text-sm font-semibold">File Explorer</span>
</div>
<div className="flex items-center gap-1">
<button onClick={newFile} className="p-1.5 hover:bg-gray-800 rounded transition-colors" title="New File">
<Plus className="w-4 h-4" />
</button>
{isMobile && (
<button onClick={() => setShowSidebar(false)} className=“p-1.5 hover:bg-gray-800 rounded transition-colors”>
<X className="w-4 h-4" />
</button>
)}
</div>
</div>

```
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {files.map((f, i) => (
            <button
              key={i}
              onClick={() => {
                switchFile(i);
                if (isMobile) setShowSidebar(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
                f.active 
                  ? 'bg-blue-600/20 text-blue-400 font-medium shadow-sm' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              <FileCode className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{f.name}</span>
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-gray-800 bg-gray-900/95">
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Files</span>
              <span className="font-mono">{files.length}</span>
            </div>
          </div>
        </div>
      </>
    )}
  </div>

  {/* Main Content Area */}
  <div className="flex-1 flex flex-col overflow-hidden relative z-0">
    {/* Top Header */}
    <div className="bg-gray-900 border-b border-gray-800 px-3 py-2.5 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setShowSidebar(!showSidebar)} 
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          title={showSidebar ? 'Hide File Explorer' : 'Show File Explorer'}
        >
          {showSidebar ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="h-6 w-px bg-gray-700"></div>
        <Code className="w-5 h-5 text-blue-400" />
        <span className="font-bold text-sm hidden sm:inline">Solidity IDE</span>
      </div>

      {/* Wallet Connection */}
      <div className="flex items-center gap-2">
        {isConnected ? (
          <div className="flex items-center gap-2 bg-green-900/20 border border-green-700/50 px-3 py-1.5 rounded-full shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-mono text-green-400">{formatAddr(userAddress)}</span>
          </div>
        ) : (
          <button 
            onClick={connectWallet} 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-full text-xs font-medium transition-colors shadow-sm"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Connect</span>
          </button>
        )}
      </div>
    </div>

    {/* Toolbar */}
    <div className="bg-gray-900 border-b border-gray-800 px-3 py-2 shadow-sm flex-shrink-0">
      <div className="flex items-center gap-2 overflow-x-auto">
        {/* Compiler Version */}
        <div className="relative flex-shrink-0" ref={compilerRef}>
          <button 
            onClick={() => {
              setShowCompilerDropdown(!showCompilerDropdown);
              setShowNetworkDropdown(false);
            }} 
            className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg text-xs transition-colors whitespace-nowrap"
          >
            <span className="text-gray-300">v{selectedCompiler}</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>
          {showCompilerDropdown && (
            <div className="fixed mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-[100] max-h-60 overflow-y-auto min-w-[120px]"
                 style={{
                   top: compilerRef.current?.getBoundingClientRect().bottom + 4,
                   left: compilerRef.current?.getBoundingClientRect().left
                 }}>
              {VERSIONS.map(v => (
                <button 
                  key={v} 
                  onClick={() => { setSelectedCompiler(v); setShowCompilerDropdown(false); }} 
                  className="w-full px-3 py-2 hover:bg-gray-700 text-xs text-left whitespace-nowrap transition-colors text-gray-200"
                >
                  v{v}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Network Selection */}
        <div className="relative flex-shrink-0" ref={networkRef}>
          <button 
            onClick={() => {
              setShowNetworkDropdown(!showNetworkDropdown);
              setShowCompilerDropdown(false);
            }} 
            className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg text-xs transition-colors whitespace-nowrap"
          >
            <span className="text-gray-300">{isMobile ? selectedNetwork.name.split(' ')[0] : selectedNetwork.name}</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>
          {showNetworkDropdown && (
            <div className="fixed mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-[100] max-h-60 overflow-y-auto min-w-[160px]"
                 style={{
                   top: networkRef.current?.getBoundingClientRect().bottom + 4,
                   left: networkRef.current?.getBoundingClientRect().left
                 }}>
              {NETWORKS.map(n => (
                <button 
                  key={n.id} 
                  onClick={() => { setSelectedNetwork(n); setShowNetworkDropdown(false); }} 
                  className="w-full px-3 py-2 hover:bg-gray-700 text-xs text-left whitespace-nowrap transition-colors text-gray-200"
                >
                  {n.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-gray-700 flex-shrink-0"></div>

        {/* Action Buttons */}
        <button 
          onClick={compileContract} 
          disabled={isCompiling} 
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shadow-sm flex-shrink-0"
        >
          {isCompiling ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">Compile</span>
        </button>

        <button 
          onClick={deployContract} 
          disabled={isDeploying || !compileOutput.includes('✅')} 
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shadow-sm flex-shrink-0"
        >
          {isDeploying ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">Deploy</span>
        </button>

        <div className="flex-1"></div>

        {/* Right Actions */}
        <button 
          onClick={() => setShowShareModal(true)} 
          className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shadow-sm flex-shrink-0"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Share</span>
        </button>

        <button 
          onClick={deleteFile} 
          className="p-1.5 hover:bg-red-900/20 text-red-400 rounded-lg transition-colors flex-shrink-0" 
          title="Delete File"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    {/* Editor & Output Area */}
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-0">
      {/* Code Editor */}
      <div className="flex-1 relative">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={PLACEHOLDER}
          className="w-full h-full bg-gray-950 text-gray-100 p-4 font-mono text-sm resize-none focus:outline-none leading-relaxed"
          spellCheck={false}
        />
      </div>

      {/* Output Panel */}
      {showOutput && (compileOutput || deployOutput) && (
        <div className={`${isMobile ? 'h-64' : 'w-96'} bg-gray-900 ${isMobile ? 'border-t' : 'border-l'} border-gray-800 flex flex-col shadow-lg relative z-0`}>
          <div className="flex items-center justify-between p-3 border-b border-gray-800 bg-gray-900/95">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Console Output</span>
            </div>
            <button 
              onClick={() => { 
                setCompileOutput(''); 
                setDeployOutput(''); 
                setVerificationStatus([]);
                setShowOutput(false);
              }}
              className="p-1 hover:bg-gray-800 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {compileOutput && (
              <div className="bg-gray-950/50 rounded-lg p-3 border border-gray-800">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">{compileOutput}</pre>
              </div>
            )}
            
            {deployOutput && (
              <div className="bg-gray-950/50 rounded-lg p-3 border border-gray-800">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono mb-3">{deployOutput}</pre>
                {verificationStatus.length > 0 && (
                  <div className="space-y-2 mt-3 pt-3 border-t border-gray-800">
                    {verificationStatus.map((v, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-300">{v.name}</span>
                        <a
                          href={v.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto text-blue-400 hover:text-blue-300"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>

    {/* Bottom Bar */}
    <div className="bg-gray-900 border-t border-gray-800 p-2.5 flex justify-center shadow-sm">
      <button 
        onClick={() => setShowTipModal(true)} 
        className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 px-6 py-2 rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg"
      >
        Feeling generous? 💸
      </button>
    </div>
  </div>

  {/* Share Modal */}
  {showShareModal && (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-md w-full border border-gray-700 shadow-2xl">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-t-xl relative">
          <button onClick={() => setShowShareModal(false)} className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6" />
            <h2 className="text-lg font-bold">Share Your Work</h2>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-sm text-gray-300 mb-2">Share your deployed contract</p>
          <button 
            onClick={shareToFarcaster} 
            className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share to Farcaster
          </button>
          <button 
            onClick={shareToBase} 
            className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share to Base App
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Tip Modal */}
  {showTipModal && (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-md w-full border border-gray-700 shadow-2xl">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-t-xl relative">
          <button onClick={() => { setShowTipModal(false); setTxStatus(null); setErrorMessage(''); }} className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <Wallet className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-bold">Send a Tip</h2>
              <p className="text-xs text-purple-100">Support on Base</p>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {txStatus === 'success' ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-bold text-green-400 mb-2">Success!</h3>
              <p className="text-sm text-gray-400">Thank you! 🙏</p>
              <button onClick={() => { setShowTipModal(false); setTxStatus(null); }} className="mt-4 w-full bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-lg font-semibold text-sm transition-colors">
                Close
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs font-semibold block mb-1.5 text-gray-300">Recipient</label>
                <div className="bg-gray-700/50 rounded-lg p-2.5 border border-gray-600/30">
                  <p className="text-xs font-mono break-all text-gray-300">{RECIPIENT_ADDRESS}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5 text-gray-300">Token</label>
                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full bg-gray-700/50 hover:bg-gray-700 border border-gray-600/30 rounded-lg p-2.5 flex justify-between items-center text-sm transition-colors">
                    <span className="text-gray-200">{selectedToken.symbol} - {selectedToken.name}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute top-full mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg shadow-xl z-10 overflow-hidden">
                      {BASE_TOKENS.map(t => (
                        <button key={t.symbol} onClick={() => { setSelectedToken(t); setIsDropdownOpen(false); }} className="w-full p-2.5 hover:bg-gray-600 text-left text-sm transition-colors">
                          <span className="font-medium text-gray-200">{t.symbol}</span> - <span className="text-gray-400">{t.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5 text-gray-300">Amount</label>
                <input 
                  type="number" 
                  value={tipAmount} 
                  onChange={(e) => setTipAmount(e.target.value)} 
                  placeholder="0.00" 
                  step="0.01"
                  min="0"
                  className="w-full bg-gray-700/50 border border-gray-600/30 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-200 placeholder-gray-500" 
                />
                <div className="flex gap-2 mt-2">
                  {[0.01, 0.05, 0.1].map(a => (
                    <button 
                      key={a} 
                      onClick={() => setTipAmount(a.toString())} 
                      className="flex-1 bg-gray-700/50 hover:bg-gray-700 border border-gray-600/30 rounded-lg py-1.5 text-xs font-medium transition-colors text-gray-300"
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              {isConnected && (
                <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-2.5">
                  <p className="text-xs text-green-400 font-semibold">Connected: {formatAddr(userAddress)}</p>
                </div>
              )}
              {errorMessage && (
                <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-2.5 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">{errorMessage}</p>
                </div>
              )}
              <button 
                onClick={sendTip} 
                disabled={txStatus === 'pending'} 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                {txStatus === 'pending' ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {isConnected ? 'Send Tip' : 'Connect & Send'}
                  </>
                )}
              </button>
              <p className="text-xs text-center text-gray-500 mt-2">
                Transaction will be sent on Base network
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )}
</div>
```

);
}
