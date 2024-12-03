#
# Copyright (C) 2024 gSpot (https://github.com/gSpotx2f/luci-app-interfaces-statistics)
#
# This is free software, licensed under the MIT License.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-interfaces-statistics
PKG_VERSION:=0.4.0
PKG_RELEASE:=4
LUCI_TITLE:=Network interfaces statistics
LUCI_PKGARCH:=all
PKG_LICENSE:=MIT

#include ../../luci.mk
include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
