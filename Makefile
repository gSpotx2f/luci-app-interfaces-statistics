#
# Copyright (C) 2020 gSpot (https://github.com/gSpotx2f/luci-app-interfaces-statistics)
#
# This is free software, licensed under the MIT License.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-interfaces-statistics
LUCI_TITLE:=Network interfaces statistics
LUCI_DEPENDS:=+luci-mod-admin-full
LUCI_PKGARCH:=all
PKG_LICENSE:=MIT

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
