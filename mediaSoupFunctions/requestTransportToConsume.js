import createConsumer from "./createConsumer"
import createConsumerTransport from "./createConsumerTransport"

const requestTransportToConsume = (consumeData,socket,device,consumers)=>{
    
    consumeData.audioPidsToCreate.forEach(async(audioPid,i)=>{
        const videoPid = consumeData.videoPidsToCreate[i]
        // expecting back transport params for THIS audioPid. Maybe 5 times, maybe 0
    const consumerTransportParams = await socket.emitWithAck('requestTransport',{type:"consumer",audioPid})
        console.log(consumerTransportParams)
    const consumerTransport = createConsumerTransport(consumerTransportParams,device,socket,audioPid)
        const [audioConsumer,videoConsumer] = await Promise.all([
            createConsumer(consumerTransport,audioPid,device,socket,'audio',i),
            createConsumer(consumerTransport,videoPid,device,socket,'video',i)
        ])
        console.log(audioConsumer)
        console.log(videoConsumer)
        // create a new MediaStream on the client with both tracks
        // This is why we have gone through all this pain!!!
        const combinedStream = new MediaStream([audioConsumer?.track,videoConsumer?.track])
        const remoteVideo = document.getElementById(`remote-video-${i}`)
        remoteVideo.srcObject = combinedStream
        console.log('Hope this works...')
        consumers[audioPid] = {
            combinedStream,
            userName: consumeData.associatedUserNames[i],
            consumerTransport,
            audioConsumer,
            videoConsumer
        }
    })
}

export default requestTransportToConsume