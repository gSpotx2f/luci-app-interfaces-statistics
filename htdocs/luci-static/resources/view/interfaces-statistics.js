'use strict';
'require fs';
'require network';
'require ui';

var ifacesArray = null;
var ifacesStateObject = null;
var ifacesStatisticsObject = null;

function getIfaces(ifArr) {
	ifacesArray = [];
	for(let obj of ifArr) {
		let ssid = null;
		let freq = null;
		if(obj.dev) {
			if(obj.dev.wireless) {
				ssid = obj.wif._ubusdata.net.config.ssid;
				freq = String(obj.wif._ubusdata.dev.iwinfo.frequency / 1000);
			};
			ifacesArray.push([
				obj.dev.rawname,
				'/sys/class/net/' + obj.dev.rawname,
				obj.dev.macaddr,
				ssid,
				freq,
			]);
		};
	};
	ifacesArray.sort((a, b) => (a[0] > b[0]) ? 1 : (a[0] < b[0]) ? -1 : 0);
}

function getIfaceState(ifaceArr) {
	return Promise.all([
		ifaceArr[0],
		fs.trimmed(ifaceArr[1] + '/operstate'),
	]);
}

function parseIfacesData(ifacesStat) {
	if(!ifacesStat) return;
	ifacesStatisticsObject = {};
	let statStringsArray = ifacesStat.trim().split('\n');
	for(let str of statStringsArray.slice(2)) {
		let strArr = str.trim().split(/\s+/);
		ifacesStatisticsObject[strArr[0].replace(':', '')] = strArr.slice(1);
	};
}

function setIfacesData() {
	for(let iface of ifacesArray) {
		let ifaceName = iface[0];

		let state = document.getElementById(ifaceName + '_state');
		if(state) {
			let ifaceState = ifacesStateObject[ifaceName][0];
			state.textContent = (ifaceState === 'up' || ifaceState === 'unknown') ?
				_('Interface is up') : _('Interface is down');
			state.style = (ifaceState === 'up' || ifaceState === 'unknown') ?
				'background-color:#46a546' : '';
		};

		if(!ifacesStatisticsObject[ifaceName]) continue;

		let bytes_rx = document.getElementById(ifaceName + '_bytes_rx');
		if(bytes_rx) {
			bytes_rx.textContent = ifacesStatisticsObject[ifaceName][0];
		};

		let bytes_tx = document.getElementById(ifaceName + '_bytes_tx');
		if(bytes_tx) {
			bytes_tx.textContent = ifacesStatisticsObject[ifaceName][8];
		};

		let packets_rx = document.getElementById(ifaceName + '_packets_rx');
		if(packets_rx) {
			packets_rx.textContent = ifacesStatisticsObject[ifaceName][1];
		};

		let packets_tx = document.getElementById(ifaceName + '_packets_tx');
		if(packets_tx) {
			packets_tx.textContent = ifacesStatisticsObject[ifaceName][9];
		};

		let errors_rx = document.getElementById(ifaceName + '_errors_rx');
		if(errors_rx) {
			errors_rx.textContent = ifacesStatisticsObject[ifaceName][2];
		};

		let errors_tx = document.getElementById(ifaceName + '_errors_tx');
		if(errors_tx) {
			errors_tx.textContent = ifacesStatisticsObject[ifaceName][10];
		};

		let drop_rx = document.getElementById(ifaceName + '_drop_rx');
		if(drop_rx) {
			drop_rx.textContent = ifacesStatisticsObject[ifaceName][3];
		};

		let drop_tx = document.getElementById(ifaceName + '_drop_tx');
		if(drop_tx) {
			drop_tx.textContent = ifacesStatisticsObject[ifaceName][11];
		};

		let fifo_rx = document.getElementById(ifaceName + '_fifo_rx');
		if(fifo_rx) {
			fifo_rx.textContent = ifacesStatisticsObject[ifaceName][4];
		};

		let fifo_tx = document.getElementById(ifaceName + '_fifo_tx');
		if(fifo_tx) {
			fifo_tx.textContent = ifacesStatisticsObject[ifaceName][12];
		};

		let frame_rx = document.getElementById(ifaceName + '_frame_rx');
		if(frame_rx) {
			frame_rx.textContent = ifacesStatisticsObject[ifaceName][5];
		};

		let collisions_tx = document.getElementById(ifaceName + '_collisions_tx');
		if(collisions_tx) {
			collisions_tx.textContent = ifacesStatisticsObject[ifaceName][13];
		};

		let compressed_rx = document.getElementById(ifaceName + '_compressed_rx');
		if(compressed_rx) {
			compressed_rx.textContent = ifacesStatisticsObject[ifaceName][6];
		};

		let compressed_tx = document.getElementById(ifaceName + '_compressed_tx');
		if(compressed_tx) {
			compressed_tx.textContent = ifacesStatisticsObject[ifaceName][15];
		};

		let multicast_rx = document.getElementById(ifaceName + '_multicast_rx');
		if(multicast_rx) {
			multicast_rx.textContent = ifacesStatisticsObject[ifaceName][7];
		};

		let carrier_tx = document.getElementById(ifaceName + '_carrier_tx');
		if(carrier_tx) {
			carrier_tx.textContent = ifacesStatisticsObject[ifaceName][14];
		};
	};
}

return L.view.extend({
	poll: async function() {
		await Promise.all(
			ifacesArray.map(i => getIfaceState(i))
		).then(ifacesStateArray => {
			ifacesStateObject = {};
			for(let i of ifacesStateArray) {
				ifacesStateObject[i[0]] = i.slice(1);
			};
		}).catch(e => ui.addNotification(null, E('p', {}, e.message)));

		fs.read_direct('/proc/net/dev').then(ifacesStat => {
			parseIfacesData(ifacesStat);
			setIfacesData();
		}).catch(e => ui.addNotification(null, E('p', {}, e.message)));
	},

	load: function() {
		return Promise.all([
			network.getDevices(),
			L.resolveDefault(fs.read_direct('/proc/net/dev'), null),
		]).catch(e => ui.addNotification(null, E('p', {}, e.message)));
	},

	render: function(ifacesData) {

		let ifacesNode = E('div', { 'class': 'cbi-section fade-in' },
			E('div', { 'class': 'cbi-section-node' },
				E('div', { 'class': 'cbi-value' },
					E('em', {}, _('No interfaces detected'))
				)
			)
		);

		if(ifacesData && ifacesData[0] && ifacesData[0].length > 0) {
			ifacesNode = E('div', { 'class': 'cbi-section fade-in' },
				E('div', { 'class': 'cbi-section-node' },
					E('div', { 'class': 'cbi-value' },
						E('em', { 'class': 'spinning' }, _('Collecting data...'))
					)
				)
			);

			getIfaces(ifacesData[0]);
			parseIfacesData(ifacesData[1]);

			Promise.all(
				ifacesArray.map(i => getIfaceState(i))
			).then(ifacesStateArray => {

				ifacesStateObject = {};
				for(let i of ifacesStateArray) {
					ifacesStateObject[i[0]] = i.slice(1);
				};

				let ifacesTabs = E('div', { 'class': 'cbi-section fade-in' },
					E('div', { 'class': 'cbi-section-node' },
						E('div', { 'class': 'cbi-value' }, [
							E('div', { 'style': 'width:100%; text-align:right !important' },
								E('button', {
									'class': 'btn',
									'click': () => window.location.reload(),
								}, _('Refresh interfaces'))
							)
						])
					)
				);

				let tabsContainer = E('div', { 'class': 'cbi-section-node cbi-section-node-tabbed' });
				ifacesTabs.append(tabsContainer);

				for(let i = 0; i < ifacesArray.length; i++) {
					let ifaceName = ifacesArray[i][0];
					let ifaceState = ifacesStateObject[ifaceName][0];
					let ifaceMac = ifacesArray[i][2];
					let ifaceSsid = ifacesArray[i][3];
					let ifaceFreq = ifacesArray[i][4];

					let ifaceTab = E('div', {
						'data-tab': i,
						'data-tab-title': ifaceName,
					});
					tabsContainer.append(ifaceTab);

					let ifaceTable = E('div', { 'class': 'table' });

					if(ifaceSsid) {
						ifaceTable.append(
							E('div', { 'class': 'tr' }, [
								E('div', { 'class': 'td left', 'width': '33%' }, _('SSID') + ':'),
								E('div', { 'class': 'td left' }, ifaceSsid),
							]),
						);
					};

					if(ifaceFreq) {
						ifaceTable.append(
							E('div', { 'class': 'tr' }, [
								E('div', { 'class': 'td left', 'width': '33%' }, _('Frequency') + ':'),
								E('div', { 'class': 'td left' }, ifaceFreq + ' ' + _('Ghz')),
							]),
						);
					};

					if(ifaceMac) {
						ifaceTable.append(
							E('div', { 'class': 'tr' }, [
								E('div', { 'class': 'td left', 'width': '33%' }, _('MAC Address') + ':'),
								E('div', { 'class': 'td left' }, ifaceMac),
							]),
						);
					};

					ifaceTable.append(
						E('div', { 'class': 'tr' }, [
							E('div', { 'class': 'td left', 'width': '33%' }, _('State') + ':'),
							E('div', { 'class': 'td left' },
								E('span', {
									'id': ifaceName + '_state',
									'class': 'label',
									'style': (ifaceState === 'up' || ifaceState === 'unknown') ?
										'background-color:#46a546' : '',
								},
									(ifaceState === 'up' || ifaceState === 'unknown') ?
										_('Interface is up') : _('Interface is down')
								)
							),
						]),
					);

					let statTable = E('div', { 'class': 'table' }, [
						E('div', { 'class': 'tr table-titles' }, [
							E('div', { 'class': 'th left', 'width': '33%' }, _('Parameter')),
							E('div', { 'class': 'th left', 'width': '33%' }, _('Receive')),
							E('div', { 'class': 'th left' }, _('Transmit')),
						]),
						E('div', { 'class': 'tr' }, [
							E('div', { 'class': 'td left', 'data-title': _('Parameter') }, _('bytes')),
							E('div', { 'class': 'td left', 'id': ifaceName + '_bytes_rx', 'data-title': _('Receive') },
								ifacesStatisticsObject[ifaceName][0]),
							E('div', { 'class': 'td left', 'id': ifaceName + '_bytes_tx', 'data-title': _('Transmit') },
								ifacesStatisticsObject[ifaceName][8]),
						]),
						E('div', { 'class': 'tr' }, [
							E('div', { 'class': 'td left', 'data-title': _('Parameter') }, _('packets')),
							E('div', { 'class': 'td left', 'id': ifaceName + '_packets_rx', 'data-title': _('Receive') },
								ifacesStatisticsObject[ifaceName][1]),
							E('div', { 'class': 'td left', 'id': ifaceName + '_packets_tx', 'data-title': _('Transmit') },
								ifacesStatisticsObject[ifaceName][9]),
						]),
						E('div', { 'class': 'tr' }, [
							E('div', { 'class': 'td left', 'data-title': _('Parameter') }, _('errors')),
							E('div', { 'class': 'td left', 'id': ifaceName + '_errors_rx', 'data-title': _('Receive') },
								ifacesStatisticsObject[ifaceName][2]),
							E('div', { 'class': 'td left', 'id': ifaceName + '_errors_tx', 'data-title': _('Transmit') },
								ifacesStatisticsObject[ifaceName][10]),
						]),
						E('div', { 'class': 'tr' }, [
							E('div', { 'class': 'td left', 'data-title': _('Parameter') }, _('dropped')),
							E('div', { 'class': 'td left', 'id': ifaceName + '_drop_rx', 'data-title': _('Receive') },
								ifacesStatisticsObject[ifaceName][3]),
							E('div', { 'class': 'td left', 'id': ifaceName + '_drop_tx', 'data-title': _('Transmit') },
								ifacesStatisticsObject[ifaceName][11]),
						]),
						E('div', { 'class': 'tr' }, [
							E('div', { 'class': 'td left', 'data-title': _('Parameter') }, _('fifo')),
							E('div', { 'class': 'td left', 'id': ifaceName + '_fifo_rx', 'data-title': _('Receive') },
								ifacesStatisticsObject[ifaceName][4]),
							E('div', { 'class': 'td left', 'id': ifaceName + '_fifo_tx', 'data-title': _('Transmit') },
								ifacesStatisticsObject[ifaceName][12]),
						]),
						E('div', { 'class': 'tr' }, [
							E('div', { 'class': 'td left', 'data-title': _('Parameter') }, _('frame')),
							E('div', { 'class': 'td left', 'id': ifaceName + '_frame_rx', 'data-title': _('Receive') },
								ifacesStatisticsObject[ifaceName][5]),
							E('div', { 'class': 'td left', 'data-title': _('Transmit') }, '&#160;'),
						]),
						E('div', { 'class': 'tr' }, [
							E('div', { 'class': 'td left', 'data-title': _('Parameter') }, _('collisions')),
							E('div', { 'class': 'td left', 'data-title': _('Receive') }, '&#160;'),
							E('div', { 'class': 'td left', 'id': ifaceName + '_collisions_tx', 'data-title': _('Transmit') },
								ifacesStatisticsObject[ifaceName][13]),
						]),
						E('div', { 'class': 'tr' }, [
							E('div', { 'class': 'td left', 'data-title': _('Parameter') }, _('compressed')),
							E('div', { 'class': 'td left', 'id': ifaceName + '_compressed_rx', 'data-title': _('Receive') },
								ifacesStatisticsObject[ifaceName][6]),
							E('div', { 'class': 'td left', 'id': ifaceName + '_compressed_tx', 'data-title': _('Transmit') },
								ifacesStatisticsObject[ifaceName][15]),
						]),
						E('div', { 'class': 'tr' }, [
							E('div', { 'class': 'td left', 'data-title': _('Parameter') }, _('multicast')),
							E('div', { 'class': 'td left', 'id': ifaceName + '_multicast_rx', 'data-title': _('Receive') },
								ifacesStatisticsObject[ifaceName][7]),
							E('div', { 'class': 'td left', 'data-title': _('Transmit') }, '&#160;'),
						]),
						E('div', { 'class': 'tr' }, [
							E('div', { 'class': 'td left', 'data-title': _('Parameter') }, _('carrier')),
							E('div', { 'class': 'td left', 'data-title': _('Receive') }, '&#160;'),
							E('div', { 'class': 'td left', 'id': ifaceName + '_carrier_tx', 'data-title': _('Transmit') },
								ifacesStatisticsObject[ifaceName][14]),
						]),
					]);

					ifaceTab.append(E([
						E('div', { 'class': 'cbi-value' }, ifaceTable),
						E('div', { 'class': 'cbi-value' }, statTable),
					]));
				};

				ui.tabs.initTabGroup(tabsContainer.children);
				ifacesNode.replaceWith(ifacesTabs);

				L.Poll.add(this.poll);

			}).catch(e => ui.addNotification(null, E('p', {}, e.message)));
		};

		return E([
			E('h2', { 'class': 'fade-in' }, _('Interfaces statistics')),
			E('div', { 'class': 'cbi-section-descr fade-in' }),
			ifacesNode,
		]);
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null,
});
