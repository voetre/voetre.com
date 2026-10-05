// Create the sound object outside of any function for efficiency
var hoverSound = new Audio("sounds/sfx_hover.mp3");
hoverSound.volume = 0.1; // Set volume to 70%
var clickSound = new Audio("sounds/sfx_confirm.mp3");
clickSound.volume = 0.1; // Set volume to 70%



const miniwindowClosebutton = document.querySelector('.miniwindowClose-button');
const miniwindowDiv = document.querySelector('.miniwindowDiv');
const miniwindowTitlebar = miniwindowDiv.querySelector('.miniwindowTitle-bar');

// Photography window elements
const photographyButton = document.getElementById('photographyButton');
const photographyDiv = document.getElementById('photographyDiv');
const photographyClosebutton = document.querySelector('.photographyClose-button');
const photographyMaximizebutton = document.querySelector('.photographyMaximize-button');
const photographyTitlebar = photographyDiv.querySelector('.photographyTitle-bar');

// Add a click event listener to the document
document.addEventListener("click", function(event) {
  // Check if the clicked element is a button
  if (event.target.tagName === "BUTTON") {
    // Play the sound
    clickSound.play();
    clickSound.currentTime = 0;
  }
});

window.onload = function() {
  const backgroundMusic = document.getElementById('backgroundMusic');
  backgroundMusic.volume = 0.35;
  
  // Use hardcoded video list directly for better reliability
  function getVideoList() {
    return [
      'videos/AhtUrhganWhiteGate.webm',
      'videos/Altaieu.webm',
      'videos/BehemothsDominion.webm',
      'videos/MogGarden1.webm',
      'videos/MogGarden2.webm',
      'videos/MogHouse.webm',
      'videos/Selbina.webm',
      'videos/ShadowLord1.webm',
      'videos/Tulia.webm',
      'videos/Windurst.webm',
      'videos/ZiTah.webm'
    ];
  }
  
  // Fallback to MP4 if WebM is not supported
  function getVideoListWithFallback() {
    const webmVideos = getVideoList();
    const mp4Videos = [
      'videos/AhtUrhganWhiteGate.mp4',
      'videos/Altaieu.mp4',
      'videos/BehemothsDominion.mp4',
      'videos/MogGarden1.mp4',
      'videos/MogGarden2.mp4',
      'videos/MogHouse.mp4',
      'videos/Selbina.mp4',
      'videos/ShadowLord1.mp4',
      'videos/Tulia.mp4',
      'videos/Windurst.mp4',
      'videos/ZiTah.mp4'
    ];
    
    // Check if WebM is supported
    const video = document.createElement('video');
    const webmSupported = video.canPlayType('video/webm') !== '';
    
    return webmSupported ? webmVideos : mp4Videos;
  }
  
  let videos = [];
  let currentVideoIndex = 0;
  const backgroundVideo = document.getElementById('backgroundVideo');
  
  function loadAndPlayVideo() {
    if (videos.length === 0) return;
    
    console.log('Loading video:', videos[currentVideoIndex]);
    
    // Load and play video
    backgroundVideo.src = videos[currentVideoIndex];
    backgroundVideo.style.display = 'block';
    
    backgroundVideo.addEventListener('loadeddata', function() {
      console.log('Video loaded successfully');
      backgroundVideo.classList.add('loaded');
      backgroundVideo.play().catch(e => console.log('Video autoplay failed:', e));
    }, { once: true });
    
    backgroundVideo.addEventListener('error', function(e) {
      console.error('Video loading error:', e);
      console.error('Video error details:', backgroundVideo.error);
      
      // Try MP4 fallback if WebM fails
      if (videos[currentVideoIndex].endsWith('.webm')) {
        console.log('Attempting MP4 fallback...');
        const mp4Fallback = videos[currentVideoIndex].replace('.webm', '.mp4');
        backgroundVideo.src = mp4Fallback;
        
        backgroundVideo.addEventListener('loadeddata', function() {
          console.log('MP4 fallback loaded successfully');
          backgroundVideo.classList.add('loaded');
          backgroundVideo.play().catch(e => console.log('Video autoplay failed:', e));
        }, { once: true });
      }
    }, { once: true });
  }
  
  function cycleVideo() {
    if (videos.length === 0) return;
    
    console.log('Starting video cycle - fading out current video');
    // Fade out current video
    backgroundVideo.classList.add('fade-out');
    
    setTimeout(() => {
      console.log('Fade out complete, loading next video');
      currentVideoIndex = (currentVideoIndex + 1) % videos.length;
      backgroundVideo.classList.remove('loaded', 'fade-out');
      loadAndPlayVideo();
    }, 500);
  }
  
  // Initialize video list and start playing
  videos = getVideoListWithFallback();
  currentVideoIndex = Math.floor(Math.random() * videos.length);
  loadAndPlayVideo();
  
  // Cycle video every 20 seconds
  setInterval(cycleVideo, 20000);
};

document.querySelectorAll("button").forEach(button => {
    button.addEventListener("mouseover", () => {
      hoverSound.play();
      hoverSound.currentTime = 0;
    });
});

const backgroundMusic = document.getElementById('backgroundMusic');
const muteButton = document.getElementById('muteButton');

// Add a click event listener to the mute button
muteButton.addEventListener('click', () => {
  if (backgroundMusic.paused) {
    // If the audio is paused, play it and update the button text
    backgroundMusic.play();
    muteButton.textContent = 'Pause Music';
  } else {
    // If the audio is playing, pause it and update the button text
    backgroundMusic.pause();
    muteButton.textContent = 'Play Music';
  }
});

// Assign click event listeners to individual buttons (optional):
// You can add specific functionality for each button here. For example:

//document.getElementById("ffxiButton0").addEventListener("click", function() {
  // Do something specific for Button 0
//});

document.getElementById("guestbookButton").addEventListener("click", function() {
  document.getElementById("guestbook").style.display = 'block';
});

// Photography button click event
photographyButton.addEventListener("click", function() {
  photographyDiv.style.display = 'block';
});

// Dragging for guestbook window
let isDragging = false;
let offsetX, offsetY;

miniwindowTitlebar.addEventListener('mousedown', (e) => {
  isDragging = true;
  offsetX = e.clientX - miniwindowDiv.offsetLeft;
  offsetY = e.clientY - miniwindowDiv.offsetTop;
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});

document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    miniwindowDiv.style.left = (e.clientX - offsetX) + 'px';
    miniwindowDiv.style.top = (e.clientY - offsetY) + 'px';
  }
});

miniwindowClosebutton.addEventListener('click', () => {
  miniwindowDiv.style.display = 'none';
});

// Dragging for photography window
let isPhotoDragging = false;
let photoOffsetX, photoOffsetY;

photographyTitlebar.addEventListener('mousedown', (e) => {
  isPhotoDragging = true;
  photoOffsetX = e.clientX - photographyDiv.offsetLeft;
  photoOffsetY = e.clientY - photographyDiv.offsetTop;
});

document.addEventListener('mouseup', () => {
  isPhotoDragging = false;
});

document.addEventListener('mousemove', (e) => {
  if (isPhotoDragging) {
    photographyDiv.style.left = (e.clientX - photoOffsetX) + 'px';
    photographyDiv.style.top = (e.clientY - photoOffsetY) + 'px';
  }
});

photographyMaximizebutton.addEventListener('click', () => {
  // Disable dragging during animation
  isPhotoDragging = false;
  
  photographyDiv.classList.toggle('maximized');
  
  // Re-enable dragging after animation completes
  setTimeout(() => {
    isPhotoDragging = false;
  }, 300);
});

photographyClosebutton.addEventListener('click', () => {
  photographyDiv.style.display = 'none';
});
