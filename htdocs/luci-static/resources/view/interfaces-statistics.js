'use strict';
'require rpc';
'require ui';

const labelColorUp = '#46a546';

return L.view.extend({
	ifacesArray: [],

	callNetDevice: rpc.declare({
		object: 'network.device',
		method: 'status',
		expect: { '': {} }
	}),

	setIfacesData: function(ifacesData) {
		for(let iface of this.ifacesArray) {
			let ifaceState = null;
			let ifacesStatisticsObject = null;

			if(ifacesData[iface] !== undefined) {
				ifaceState = ifacesData[iface].up;
				ifacesStatisticsObject = ifacesData[iface].statistics;
			};

			let state = document.querySelector('[data-ifstat="%s_state"]'.format(iface));
			state.textContent = (ifaceState) ? _('Interface is up') : _('Interface is down');
			state.style = (ifaceState) ? 'background-color:'+ labelColorUp : '';

			if(!ifacesStatisticsObject) continue;

			for(let [k, v] of Object.entries(ifacesStatisticsObject)) {
				let elem = document.querySelector('[data-ifstat="%s_%s"]'.format(iface, k));
				if(elem !== null) {
					elem.textContent = v;
				};
			};
		};
	},

	poll: function() {
		return this.callNetDevice().then(ifacesData => {
			this.setIfacesData(ifacesData);
		}).catch(e => ui.addNotification(null, E('p', {}, e.message)));
	},

	load: function() {
		return this.callNetDevice().catch(
			e => ui.addNotification(null, E('p', {}, e.message)));
	},

	render: function(ifacesData) {

		let ifacesNode = E('div', { 'class': 'cbi-section fade-in' },
			E('div', { 'class': 'cbi-section-node' },
				E('div', { 'class': 'cbi-value' },
					E('em', {}, _('No interfaces detected'))
				)
			)
		);

		if(ifacesData) {
			ifacesNode = E('div', { 'class': 'cbi-section fade-in' },
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
			ifacesNode.append(tabsContainer);

			let tab = 0;

			for(let iface in ifacesData) {
				let ifaceName = iface;
				let ifacesStatisticsObject = ifacesData[iface].statistics;
				let ifaceState = ifacesData[iface].up;
				let ifaceMac = ifacesData[iface].macaddr;

				if(ifaceMac === "00:00:00:00:00:00") {
					ifaceMac = null;
				};

				this.ifacesArray.push(iface);
				this.ifacesArray.sort();

				let ifaceTab = E('div', {
					'data-tab': tab,
					'data-tab-title': ifaceName,
				});
				tabsContainer.append(ifaceTab);

				let ifaceTable = E('div', { 'class': 'table' });

				if(ifaceMac) {
					ifaceTable.append(
						E('div', { 'class': 'tr' }, [
							E('div', { 'class': 'td left', 'style': 'min-width:33%' },
								_('MAC Address') + ':'),
							E('div', { 'class': 'td left' }, ifaceMac),
						]),
					);
				};

				ifaceTable.append(
					E('div', { 'class': 'tr' }, [
						E('div', { 'class': 'td left', 'style': 'min-width:33%' },
							_('State') + ':'),
						E('div', { 'class': 'td left' },
							E('span', {
								'data-ifstat': iface + '_state',
								'class': 'label',
								'style': (ifaceState) ?
									'background-color:'+ labelColorUp : '',
							},
								(ifaceState) ?
									_('Interface is up') : _('Interface is down')
							)
						),
					]),
				);

				let statTable = E('div', { 'class': 'table' }, [
					E('div', { 'class': 'tr table-titles' }, [
						E('div', { 'class': 'th left', 'style': 'min-width:33%' },
							_('Parameter')),
						E('div', { 'class': 'th left', 'style': 'min-width:33%' },
							_('Receive')),
						E('div', { 'class': 'th left' }, _('Transmit')),
					]),
					E('div', { 'class': 'tr' }, [
						E('div', { 'class': 'td left', 'data-title': _('Parameter') },
							_('bytes')),
						E('div', { 'class': 'td left',
							'data-ifstat': ifaceName + '_rx_bytes',
							'data-title': _('Receive') },
							ifacesStatisticsObject.rx_bytes
						),
						E('div', { 'class': 'td left',
							'data-ifstat': ifaceName + '_tx_bytes',
							'data-title': _('Transmit') },
							ifacesStatisticsObject.tx_bytes
						),
					]),
					E('div', { 'class': 'tr' }, [
						E('div', { 'class': 'td left', 'data-title': _('Parameter') },
							_('packets')),
						E('div', { 'class': 'td left',
							'data-ifstat': ifaceName + '_rx_packets',
							'data-title': _('Receive') },
							ifacesStatisticsObject.rx_packets
						),
						E('div', { 'class': 'td left',
							'data-ifstat': ifaceName + '_tx_packets',
							'data-title': _('Transmit') },
							ifacesStatisticsObject.tx_packets
						),
					]),
					E('div', { 'class': 'tr' }, [
						E('div', { 'class': 'td left', 'data-title': _('Parameter') },
							_('errors')),
						E('div', { 'class': 'td left',
							'data-ifstat': ifaceName + '_rx_errors',
							'data-title': _('Receive') },
							ifacesStatisticsObject.rx_errors
						),
						E('div', { 'class': 'td left',
							'data-ifstat': ifaceName + '_tx_errors',
							'data-title': _('Transmit') },
							ifacesStatisticsObject.tx_errors
						),
					]),
					E('div', { 'class': 'tr' }, [
						E('div', { 'class': 'td left', 'data-title': _('Parameter') },
							_('dropped')),
						E('div', { 'class': 'td left',
							'data-ifstat': ifaceName + '_rx_dropped',
							'data-title': _('Receive') },
							ifacesStatisticsObject.rx_dropped
						),
						E('div', { 'class': 'td left',
							'data-ifstat': ifaceName + '_tx_dropped',
							'data-title': _('Transmit') },
							ifacesStatisticsObject.tx_dropped
						),
					]),
					E('div', { 'class': 'tr' }, [
						E('div', { 'class': 'td left', 'data-title': _('Parameter') },
							_('compressed')),
						E('div', { 'class': 'td left',
							'data-ifstat': ifaceName + '_rx_compressed',
							'data-title': _('Receive') },
							ifacesStatisticsObject.rx_compressed
						),
						E('div', { 'class': 'td left',
							'data-ifstat': ifaceName + '_tx_compressed',
							'data-title': _('Transmit') },
							ifacesStatisticsObject.tx_compressed
						),
					]),
					E('div', { 'class': 'tr' }, [
						E('div', { 'class': 'td left', 'data-title': _('Parameter') },
							_('fifo errors')),
						E('div', { 'class': 'td left',
							'data-ifstat': ifaceName + '_rx_fifo_errors',
							'data-title': _('Receive') },
							ifacesStatisticsObject.rx_fifo_errors
						),
						E('div', { 'class': 'td left',
							'data-ifstat': ifaceName + '_tx_fifo_errors',
							'data-title': _('Transmit') },
							ifacesStatisticsObject.tx_fifo_errors
						),
					]),
					E('div', { 'class': 'tr' }, [
						E('div', { 'class': 'td left', 'data-title': _('Parameter') },
							_('multicast')),
						E('div', { 'class': 'td left',
							'data-ifstat': ifaceName + '_multicast',
							'data-title': _('Receive') },
							ifacesStatisticsObject.multicast
						),
						E('div', { 'class': 'td left', 'data-title': _('Transmit') },
							'&#160;'),
					]),
					E('div', { 'class': 'tr' }, [
						E('div', { 'class': 'td left', 'data-title': _('Parameter') },
							_('crc errors')),
						E('div', { 'class': 'td left',
							'data-ifstat': ifaceName + '_rx_crc_errors',
							'data-title': _('Receive') },
							ifacesStatisticsObject.rx_crc_errors
						),
						E('div', { 'class': 'td left', 'data-title': _('Transmit') },
							'&#160;'),
					]),
					E('div', { 'class': 'tr' }, [
						E('div', { 'class': 'td left', 'data-title': _('Parameter') },
							_('frame errors')),
						E('div', { 'class': 'td left',
							'data-ifstat': ifaceName + '_rx_frame_errors',
							'data-title': _('Receive') },
							ifacesStatisticsObject.rx_frame_errors
						),
						E('div', { 'class': 'td left', 'data-title': _('Transmit') },
							'&#160;'),
					]),
					E('div', { 'class': 'tr' }, [
						E('div', { 'class': 'td left', 'data-title': _('Parameter') },
							_('length errors')),
						E('div', { 'class': 'td left',
							'data-ifstat': ifaceName + '_rx_length_errors',
							'data-title': _('Receive') },
							ifacesStatisticsObject.rx_length_errors
						),
						E('div', { 'class': 'td left', 'data-title': _('Transmit') },
							'&#160;'),
					]),
					E('div', { 'class': 'tr' }, [
						E('div', { 'class': 'td left', 'data-title': _('Parameter') },
							_('missed errors')),
						E('div', { 'class': 'td left',
							'data-ifstat': ifaceName + '_rx_missed_errors',
							'data-title': _('Receive') },
							ifacesStatisticsObject.rx_missed_errors
						),
						E('div', { 'class': 'td left', 'data-title': _('Transmit') },
							'&#160;'),
					]),
					E('div', { 'class': 'tr' }, [
						E('div', { 'class': 'td left', 'data-title': _('Parameter') },
							_('over errors')),
						E('div', { 'class': 'td left',
							'data-ifstat': ifaceName + '_rx_over_errors',
							'data-title': _('Receive') },
							ifacesStatisticsObject.rx_over_errors
						),
						E('div', { 'class': 'td left', 'data-title': _('Transmit') },
							'&#160;'),
					]),
					E('div', { 'class': 'tr' }, [
						E('div', { 'class': 'td left', 'data-title': _('Parameter') },
							_('collisions')),
						E('div', { 'class': 'td left', 'data-title': _('Receive') },
							'&#160;'),
						E('div', { 'class': 'td left',
							'data-ifstat': ifaceName + '_collisions',
							'data-title': _('Transmit') },
							ifacesStatisticsObject.collisions
						),
					]),
					E('div', { 'class': 'tr' }, [
						E('div', { 'class': 'td left', 'data-title': _('Parameter') },
							_('carrier errors')),
						E('div', { 'class': 'td left', 'data-title': _('Receive') },
							'&#160;'),
						E('div', { 'class': 'td left',
							'data-ifstat': ifaceName + '_tx_carrier_errors',
							'data-title': _('Transmit') },
							ifacesStatisticsObject.tx_carrier_errors
						),
					]),
					E('div', { 'class': 'tr' }, [
						E('div', { 'class': 'td left', 'data-title': _('Parameter') },
							_('heartbeat errors')),
						E('div', { 'class': 'td left', 'data-title': _('Receive') },
							'&#160;'),
						E('div', { 'class': 'td left',
							'data-ifstat': ifaceName + '_tx_heartbeat_errors',
							'data-title': _('Transmit') },
							ifacesStatisticsObject.tx_heartbeat_errors
						),
					]),
					E('div', { 'class': 'tr' }, [
						E('div', { 'class': 'td left', 'data-title': _('Parameter') },
							_('aborted errors')),
						E('div', { 'class': 'td left', 'data-title': _('Receive') },
							'&#160;'),
						E('div', { 'class': 'td left',
							'data-ifstat': ifaceName + '_tx_aborted_errors',
							'data-title': _('Transmit') },
							ifacesStatisticsObject.tx_aborted_errors
						),
					]),
					E('div', { 'class': 'tr' }, [
						E('div', { 'class': 'td left', 'data-title': _('Parameter') },
							_('window errors')),
						E('div', { 'class': 'td left', 'data-title': _('Receive') },
							'&#160;'),
						E('div', { 'class': 'td left',
							'data-ifstat': ifaceName + '_tx_window_errors',
							'data-title': _('Transmit') },
							ifacesStatisticsObject.tx_window_errors
						),
					]),
				]);

				ifaceTab.append(E([
					E('div', { 'class': 'cbi-value' }, ifaceTable),
					E('div', { 'class': 'cbi-value' }, statTable),
				]));

				tab++;
			};

			ui.tabs.initTabGroup(tabsContainer.children);
			L.Poll.add(L.bind(this.poll, this));
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
