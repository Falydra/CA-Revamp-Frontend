

export default function Hero() {
 

  return (
    <div className="relative flex w-full h-fit overflow-y-auto items-center justify-center bg-cover bg-center ">
     
      <div className="relative flex flex-col items-start w-8/12 justify-center">
        <h1 className="text-5xl font-bold text-blue-500">Caritas Aeterna</h1>
        <p className="text-blue-400 font-thin text-lg">
          Your Generosity Can Change the World - Make a Difference Today by Donating <br />
          Securely and Easily, Helping Those in Need, and Creating a Brighter Future for All.
        </p>
        
      
      </div>
      <img
        className="w-1/4 h-1/2 flex opacity-75 "
        src="public\images\Hero.png"/>
    </div>
  );
}
