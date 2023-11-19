const server = require('http').createServer();
const io = require('socket.io')(server,{
    cors : 'http://localhost'
})

const PORT = 6500
server.listen(PORT,()=> console.log(`We Are Live At PORT : ${PORT}`))

io.on('connection', socket =>{

    socket.on('leave:room', room =>{
        let {room_id,name} = room;       
        socket.broadcast.to(room_id).emit('other:leave:room',name);
        socket.leave(room_id);
    })


    socket.on('joining:room', user_joining_detail =>{
        let {to,name,uuid} = user_joining_detail;
        let rooms = io.sockets.adapter.rooms;


        if(rooms.get(to) == undefined)
        {
      
            socket.join(to);
            io.to(to).emit('i:joined:successfully')
        }else if(rooms.get(to).size == 1)
        {
            socket.join(to);
            
            socket.broadcast.to(to).emit('other:joined:room',name);
        }else
        {
            if(rooms.get(to).size == 2)
            {
                socket.join(to+uuid)
                io.to(to+uuid).emit('room:full',uuid);
                console.log(rooms)
                setTimeout(()=>{
                    socket.leave(to+uuid);
                    console.log('leaves')
                    console.log(rooms)

                },1500)
            }
        }
        
        
    })

    socket.on('other:joined:success', name_get =>{
        let {name,to,offer} = name_get;
        socket.broadcast.to(to).emit('other:joined:room:success',{
            name,
            offer
        });
    })

    socket.on('answer:server', answer_get =>{
        let {answer,to} = answer_get;
        socket.broadcast.to(to).emit('answer:client',answer);

    })


    socket.on('nego:offer:server', nego_offer =>{
        let {to,offer} = nego_offer
        socket.broadcast.to(to).emit('nego:offer:client',offer);
    })


    socket.on('nego:answer:server', answer_get =>{
        let {to,answer} = answer_get
        socket.broadcast.to(to).emit('nego:answer:client',answer);
    })

    socket.on('disconnect', ()=> console.log('a user disconnected'))
})