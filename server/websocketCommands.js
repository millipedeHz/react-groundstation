
module.exports = function (io, udp, room, logger, podCommands, commConfig, daq, config, romIDScanner)
{
	var updateClientWithDatalogs = true;

	//flag used to allow/disallow Move Motor Raw command (EXTREAM DANGER WILL DAMAGE MAGNETS)
	var _brakeDevelopmentConfirmation = false;

	var _timer;

	var websocket = {};
	
	// socket.io demo
	io.on('connection', function (socket) {

	  /*
	  if(!udp.rx.listeningForUdp)
		startListening();*/

	  function startListening(){ // listen for udp packets
	  /*
		udp.rx.listeningForUdp = true;
		udp.rx.server().on('message', function (message, remote) {
			console.log("GROUNSTATION UDP - RECEIVED: " + remote.address + ':' + remote.port +' - ' + message);
			logger.log("debug", "GROUNSTATION UDP - RECEIVED: " + remote.address + ':' + remote.port +' - ' + message);

			if(updateClientWithDatalogs)
			{
			  socket.in('dataLogging').emit('udp:event', {
				log: remote.address + ':' + remote.port +' - ' + message
			  });
			}
		});*/
	  }

	  websocket.events = {

			'forceDisconnect': () => {

				socket.disconnect();

			},

			'XilinxSim:StartRun': (data) => {
				podCommands.XilinxSim_Start();
			},
			'XilinxSim:StopRun': (data) => {
				podCommands.XilinxSim_Stop();
			},
			'XilinxSim:Laser0_On': (data) => {
				podCommands.XilinxSim_Laser0On();
			},
			'XilinxSim:Laser0_Off': (data) => {
				podCommands.XilinxSim_Laser0Off();
			},
			'XilinxSim:Laser1_On': (data) => {
				podCommands.XilinxSim_Laser1On();
			},
			'XilinxSim:Laser1_Off': (data) => {
				podCommands.XilinxSim_Laser1Off();
			},
			'XilinxSim:Laser2_On': (data) => {
				podCommands.XilinxSim_Laser2On();
			},
			'XilinxSim:Laser2_Off': (data) => {
				podCommands.XilinxSim_Laser2Off();
			},
			
			
			'FlightControl_Brake:MoveMotorRAW': (data) => {

				// THIS IS EXTREAMLY DANGEROUS (WILL DAMAGE MAGNETS)

				podCommands.FCUBrake_MoveMotorRAW(data);

			},

			'FlightControl_Brake:DisableDevelopmentMode': () => {

				podCommands.FCUBrake_DisableDevelopmentMode();

			},

			'FlightControl_Brake:EnableDevelopmentMode': () => {

				// THIS IS VERY VERY DANGEROUS 

				podCommands.FCUBrake_EnableDevelopmentMode();

			},

			'FlightControl_Brake:RequestDevelopmentMode': () => {

				podCommands.FCUBrake_RequestDevelopmentMode()

			},

			//accels
			'FlightControl_Accel:StartStream_CalData': () => {
				podCommands.FCUStreamingControlStart_AccelCalData()
			},
			'FlightControl_Accel:StartStream_FullData': () => {
				podCommands.FCUStreamingControlStart_AccelFullData()
			},
			'FlightControl_Accel:StopStream': () => {
				podCommands.FCUStreamingControlStop_Accel()
			},
			'FlightControl_Accel:FineZero': (data) => {
				podCommands.FCUAccel_FineZero(data)
			},
			'FlightControl_Accel:AutoZero': (data) => {
				podCommands.FCUAccel_AutoZero(data)
			},
			'FlightControl:Stream_Brakes': (data) => {
				podCommands.FCUStreamingControlStart_Brakes();
			},
			'FlightControl:Stream_MotorsRaw': (data) => {
				podCommands.FCUStreamingControlStart_MotorsRaw();
			},

			//Contrast sensor streaming control
			'FlightControl_Contrast:StartStream': () => {
				podCommands.FCUContrast_StartStream()
			},
			'FlightControl_Contrast:StopStrean': () => {
				podCommands.FCUContrast_StopStream()
			},
			
			'PowerA:ChargeRelayOn':(data) => {
				podCommands.PowerAChargeRelayOn(data.status)
			},
			
			'PowerA:ChargeRelayOff':(data) => {
				podCommands.PowerAChargeRelayOff(data.status)
			},
			
			'PowerA:ChargeRelayOff':(data) => {
				podCommands.PowerAChargeRelayOff(data.status)
			},
			
			
			'PowerA:StreamingOff':(data) => {
				podCommands.PowerAStreamingOff();
			},
	
			'PowerA:StreamCurrentTemps':(data) => {
				podCommands.PowerAStreamCurrentTemps();
			},
	
			'PowerA:StreamTempLocations':(data) => {
				podCommands.PowerAStreamTempLocations();
			},

			'PowerA:TempSensorROMIDScan':(data) => {
				romIDScanner.BeginScanA(data.numOfSensors);
			},

			'AllLogging:Start': function(data){
				
				console.log("Starting local logging.");
				daq.isLogging = true;
			
			},'AllLogging:Stop': function(data){
				
				console.log("Stopping local logging.");
				daq.isLogging = false;
				
			},
			
			'stop:Pod': (data) => {

				podCommands.PodStop();

			},

			'client event': (data) => {

				socket.broadcast.emit('update label', data);

			},

			'start:dataLogs': (data) => {

				if(_timer)
				{

					clearInterval(_timer)

				}

				_timer = setInterval(() => {

					udp.tx.sendMessage("Thanks Pod, message received")

				}, 2500);

				updateClientWithDatalogs = true;

			},

			'stop:dataLogs': (data) => {

				if(_timer)
				{

				clearInterval(_timer)

				}

				udp.tx.sendMessage("DataLogs are no longer listening")

				updateClientWithDatalogs = false;

			},

			'power:Pod': () => {

				podCommands.PodOff()

			},

			'join': (data) => {

				var name = data.name;

				room[data.room] = data.room; //add name of room to the list of rooms

				socket.join(room[data.room]);

				console.log(name + ' joined the group. '+ socket.id);

				socket.in(room[data.room]).emit('udp:event', {log: name + ' joined the group: ' + room[data.room]});

			},

			'sendParameter': (data) => {

				podCommands.SendParameter(data);

			},

			'setIpAndPort': (data) => {

				udp.rx.updateConnectionData(data).then(() => {

				console.log('udp starting to listen again')

				if(!udp.rx.listeningForUdp)

					startListening()

				})

				udp.tx.sendMessage(JSON.stringify(data))

			},

			'lgu:positionChange': (data) => {

				udp.tx.sendMessage(JSON.stringify(data))

			},

			'lgu:speedChange': (data) => {

				udp.tx.sendMessage(JSON.stringify(data))

			},

			'disconnect': () => {

				console.log('Server got disconnected!');

			},

			'commConfig:req': (data) => {

				socket.in(room.commConfig).emit('commConfig:res', commConfig);

			},

            'update_commConfig': (data) => {

			    //console.log('data: %O', data); //DEBUG
                config.writeCommConfig(data);
            }


	  }


	  for (const event in websocket.events){

		  socket.on (event, (data) => {

			websocket.events[event](data);

		  })

	  }

	});

};