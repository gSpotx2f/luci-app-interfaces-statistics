
module('luci.controller.interfaces-statistics', package.seeall)

function index()
    entry({'admin', 'network', 'interfaces-statistics'}, view('interfaces-statistics'), _('Interfaces statistics'), 70).acl_depends = { 'luci-app-interfaces-statistics' }
end
