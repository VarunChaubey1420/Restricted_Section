// HERO BUTTON
const exploreButton = document.querySelector(".hero button");

// BOOK SECTION
const booksSection = document.querySelector(".books");

// BUTTON CLICK EVENT
exploreButton.addEventListener("click", () => {
    booksSection.scrollIntoView({
        behavior: "smooth"
    });
});

// BOOK BUTTONS
const bookButtons = document.querySelectorAll(".book-card button");

// ALERT MESSAGE
bookButtons.forEach((button) => {
    button.addEventListener("click", () => {
        alert("Book link will be added soon!");
    });
});

// NAVBAR SHADOW ON SCROLL
const navbar = document.querySelector("nav");

window.addEventListener("scroll", () => {
    if(window.scrollY > 50){
        navbar.style.boxShadow = "0 0 20px rgba(0,0,0,0.8)";
    }
    else{
        navbar.style.boxShadow = "none";
    }
});

const cards=document.querySelectorAll(".book-card");
window.addEventListener("scroll",()=>{
    cards.forEach((card)=>{
        const cardTop=card.getBoundingClientRect().top;
        if(cardTop<window.innerHeight-100){
            card.classList.add("show");
        }
    });
});

const sections=document.querySelectorAll("section");
const navLinks=document.querySelectorAll("nav a");

window.addEventListener("scroll",()=>{
    let current="";
    sections.forEach((section)=>{
        const sectionTop=section.offsetTop;
        if(scrollY>=sectionTop-200){
            current=section.getAttribute("id");
        }
    });
    navLinks.forEach((link)=>{
        link.classList.remove("active");
        if(link.getAttribute("href")==="#" + current){
            link.classList.add("active");
        }
    });
});

const text="Stories Between Worlds";
const typingText=document.getElementById("typing-text");
let index=0;
function typeText(){
    if(index<text.length){
        typingText.innerHTML+=text.charAt(index);
        index++;
        setTimeout(typeText,100);
    }
}
typeText();


// DRAGGABLE BOOK SLIDER

const sliders=document.querySelectorAll(".books-slider");
sliders.forEach((slider)=>{

    let isDown=false;
    let startX;
    let scrollLeft;

    slider.addEventListener("mousedown",(e)=>{
        isDown=true;
        startX=e.pageX-slider.offsetLeft;
        scrollLeft=slider.scrollLeft;
    });

    slider.addEventListener("mouseleave",()=>{
        isDown=false;
    });

    slider.addEventListener("mouseup",()=>{
        isDown=false;
    });

    slider.addEventListener("mousemove",(e)=>{
        if(!isDown)return;
        e.preventDefault();
        const x=e.pageX-slider.offsetLeft;
        const walk=(x-startX)*2;
        slider.scrollLeft=scrollLeft-walk;
    });
});
const buttons=document.querySelectorAll(".view-books-btn");
buttons.forEach((button)=>{
    button.addEventListener("click",()=>{
        const seriesCard=button.closest(".series-card");
        const slider=seriesCard.querySelector(".books-slider");
        slider.classList.toggle("show");
    });
});