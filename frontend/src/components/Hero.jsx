import styles from '../style'
import GetStarted from './GetStarted'

const Hero = () => {
  return (
    <section id='home' className={`tb-reveal flex md:flex-row flex-col ${styles.paddingY} gap-12 md:gap-14`}>
      <div className='flex-1 flex flex-col xl:px-0 sm:px-16 px-6'>
        <p className='tb-kicker'>one-line environment bootstrap</p>

        <h1 className='tb-display mt-4'>
          Build-ready toolchains,
          <br className='sm:block hidden' />
          <span className='text-secondary'>without setup drift.</span>
        </h1>

        <p className='tb-lede mt-6'>
          ToolBatcher gives developers a fast, verified way to generate install scripts and signed one-liner runners for Linux, macOS, and Windows. Move from machine setup to real coding in minutes.
        </p>

        <div className='grid sm:grid-cols-2 gap-4 mt-8'>
          <div className='tb-surface rounded-xl px-4 py-4'>
            <p className='tb-kicker'>security first</p>
            <p className='mt-2 text-dimWhite'>Signed manifests, nonce protection, and one-time runner fetch keep installs trustworthy.</p>
          </div>
          <div className='tb-surface rounded-xl px-4 py-4'>
            <p className='tb-kicker'>ops-friendly</p>
            <p className='mt-2 text-dimWhite'>Review exact commands before execution and keep platform-specific flows transparent.</p>
          </div>
        </div>

        <div className='mt-8'>
          <GetStarted/>
        </div>
      </div>

      <div className='flex-1 flex items-start md:my-0 my-4 relative px-6 sm:px-12 md:px-0'>
        <div className='relative w-full tb-surface rounded-[1.1rem] overflow-hidden p-4 sm:p-6'>
          <div className='flex items-center justify-between mb-4'>
            <p className='tb-kicker'>preview install board</p>
            <span className='text-dimWhite text-sm'>signed session</span>
          </div>

          <div className='bg-black/30 border border-white/10 rounded-lg p-4 relative z-[5]'>
            <div className='flex items-center justify-between gap-4'>
              <h3 className='font-poppins font-semibold text-[1.05rem]'>Install Session / tbx_a7f2...</h3>
              <span className='text-[0.7rem] uppercase tracking-[0.12em] px-2 py-1 rounded-full border border-[color:var(--color-stroke-strong)] text-secondary'>
                verified
              </span>
            </div>

            <div className='mt-4 space-y-2'>
              <div className='flex items-center justify-between gap-3 bg-black/30 border border-white/10 rounded-md px-3 py-2'>
                <span className='text-white'>git</span>
                <span className='text-dimWhite text-sm'>2.45.1</span>
                <span className='text-[0.72rem] text-secondary uppercase tracking-[0.08em]'>ready</span>
              </div>
              <div className='flex items-center justify-between gap-3 bg-black/30 border border-white/10 rounded-md px-3 py-2'>
                <span className='text-white'>node</span>
                <span className='text-dimWhite text-sm'>20.19.0</span>
                <span className='text-[0.72rem] text-secondary uppercase tracking-[0.08em]'>ready</span>
              </div>
              <div className='flex items-center justify-between gap-3 bg-black/30 border border-white/10 rounded-md px-3 py-2'>
                <span className='text-white'>docker</span>
                <span className='text-dimWhite text-sm'>latest</span>
                <span className='text-[0.72rem] text-secondary uppercase tracking-[0.08em]'>ready</span>
              </div>
            </div>

            <div className='mt-4'>
              <p className='tb-kicker mb-2'>one-liner output</p>
              <pre className='bg-black/40 border border-white/10 p-3 rounded-md overflow-x-auto text-[0.8rem] leading-[1.45] text-dimWhite whitespace-pre-wrap'>
curl -fsSL https://toolbatcher.app/install/tbx_a7f2/bootstrap.sh | bash
              </pre>
            </div>

            <div className='mt-4 h-2 rounded-full bg-black/40 overflow-hidden'>
              <div className='h-full w-[74%] bg-blue-gradient rounded-full' />
            </div>
            <p className='text-dimWhite text-xs mt-2'>3 tools prepared, waiting for confirmation</p>
          </div>

          <div className='mt-4 grid sm:grid-cols-3 gap-3 text-sm'>
            <div className='bg-black/20 border border-white/10 rounded-lg px-3 py-2'>Linux</div>
            <div className='bg-black/20 border border-white/10 rounded-lg px-3 py-2'>macOS</div>
            <div className='bg-black/20 border border-white/10 rounded-lg px-3 py-2'>Windows</div>
          </div>
        </div>

        <div className='absolute z-[0] w-[40%] h-[35%] top-0 pink__gradient' />
        <div className='absolute z-[1] w-[80%] h-[80%] rounded-full white__gradient bottom-40' />
        <div className='absolute z-[0] w-[50%] h-[50%] right-20 bottom-20 blue__gradient'/>
      </div>
    </section>
  )
}

export default Hero
