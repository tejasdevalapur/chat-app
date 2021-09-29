const socket=io();

//HTML Elements

const $messageForm = document.querySelector('#message-form');
const $messageFormInput= $messageForm.querySelector('input');
const $messageFormButton=$messageForm.querySelector('button');
const $sendLocationButton=document.querySelector('#send-location');
const $messages=document.querySelector('#messages');


//HTML Templates

const messageTemplate=document.querySelector('#message-template').innerHTML;

const locationmessageTemplate=document.querySelector('#location-message-template').innerHTML;

const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML;

//Options

const { username, room}=Qs.parse(location.search.slice(1),{ ignoreQueryprefix:true})

const autoscroll= ()=>{

    const $newMessage= $messages.lastElementChild
    
    //Height of the last message
    const newMessageStyle=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyle.marginBottom)
    const newMessageHeight= $newMessage.offsetHeight + newMessageMargin

    //Visible Height 
    const visibleHeight= $messages.offsetHeight

    //Container Height
    const containerHeight= $messages.scrollHeight

    //How far scolled
    const scrolloffset=$messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrolloffset){

        $messages.scrollTop = $messages.scrollHeight

    }


}



socket.on('message',(message)=>{

    console.log(message);
    const html =Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('H:mm A')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll()
})

socket.on("locationMessage",(url)=>{
    console.log(url);
    const html =Mustache.render(locationmessageTemplate,{
        username: url.username,
        url:url.locationmessage,
        createdAt:moment(url.createdAt).format('H:mm A')

    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll()
})

socket.on('roomData',({ room,users })=>{
    const html= Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
    autoscroll()
})
$messageForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    $messageFormButton.setAttribute('disabled', 'disabled'); 
    const message=e.target.elements.message.value;

    socket.emit("SendMessage",message,(error)=>{
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value='';
        $messageFormInput.focus();
        if (error){
            return console.log(error);
        }
        console.log('The message was delivered');
    });
})

$sendLocationButton.addEventListener('click',()=>{
    if (!navigator.geolocation){
        alert('Geo-location is not supported by your browser')
    }

    navigator.geolocation.getCurrentPosition((position)=>{

        console.log(position);
        $sendLocationButton.setAttribute('disabled', 'disabled');
        socket.emit('Sendlocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, ()=>{
            console.log('Location Shared !')
            $sendLocationButton.removeAttribute('disabled');
        })
    })
})


socket.emit('join',{username,room},(error)=>{

 if (error){
     alert(error)
     location.href='/'
 }
})