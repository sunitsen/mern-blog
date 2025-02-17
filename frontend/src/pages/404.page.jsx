import { Link } from 'react-router-dom'
import PageNotFoundImage from '../imgs/404.png'
import fullLogo from '../imgs/full-logo.png'
const PageNotFound = () =>{
    return(
    <section className="h-cover relative p-10 flex flex-col items-center gap-20 text-center" >
        <img src={PageNotFoundImage} className="select-none border-2 border-gray w-72 aspect-square object-cover rounded" alt="" />
        <h1 className="text-4xl font-gelasio leading">Page not found</h1>
        <p className="text-dark-gray text-xl leading-7 ">The page you are looking for does not exissts. Head back to the 
        <Link to="/" className='text-dark-grey underline'></Link>
        </p>

        <div className='mt-auto'>
           <img src={fullLogo} className='h-8 object-contain block mx-auto select-none' alt=""  />
           <p className='mt-5 text-dark-grey'>Read millions of stories around the world</p> 
        </div>
    </section>
    )
}

export default PageNotFound