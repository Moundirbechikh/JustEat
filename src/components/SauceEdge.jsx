import sauceDrip from '../assets/SauceDripYellow.webp'

export default function SauceEdge() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 left-0 z-20 w-[135vw] max-w-[900px] sm:w-[60vw]"
    >
      <style>{`
        .jb-flow {
          transform-origin: 50% 13.7%;
          animation: jb-flow 3.6s cubic-bezier(.2,.65,.2,1) 1s both;
        }
        @keyframes jb-flow {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .jb-flow { animation: none; }
        }
      `}</style>

      <div className="relative">
        {/* Forme rouge : bord plat puis coin arrondi à droite */}
        <svg
          viewBox="0 0 1000 141"
          className="block h-auto w-full"
          preserveAspectRatio="xMinYMax meet"
        >
          <path d="M -40 141 V 28 H 880 A 120 113 0 0 1 1000 141 Z" fill="#C62F1D" />
        </svg>

        {/* Coulure blanche */}
        <img
          src={sauceDrip}
          alt=""
          draggable="false"
          className="jb-flow absolute"
          style={{ left: '55%', width: '40%', top: '10%' }}
        />
      </div>
    </div>
  )
}