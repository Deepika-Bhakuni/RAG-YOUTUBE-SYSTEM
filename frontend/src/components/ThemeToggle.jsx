import { useState } from "react";

export default function ThemeToggle() {

const [dark,setDark]=useState(false)

const toggleTheme=()=>{

document.body.classList.toggle("dark-mode")

setDark(!dark)

}

return(

<button
className="theme-btn"
onClick={toggleTheme}
>

{dark?"☀️":"🌙"}

</button>

)

}