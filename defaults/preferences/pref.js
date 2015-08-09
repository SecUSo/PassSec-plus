/*=========================================================================
 * PassSec+ is a Firefox extension which should prevent the user from
 * entering sensitive data on insecure websites. Additionally it should
 * help the user to choose privacy friendly cookie settings.
 * Copyright (C) 2015 SecUSo
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *=========================================================================*/

pref("extensions.firefoxpasswordwarning.border",false);
pref("extensions.firefoxpasswordwarning.triangle",true);
pref("extensions.firefoxpasswordwarning.notbar",false);
pref("extensions.firefoxpasswordwarning.background",true);
pref("extensions.firefoxpasswordwarning.popup",false);
pref("extensions.firefoxpasswordwarning.popuponclick",true);
pref("extensions.firefoxpasswordwarning.statistics", true);
pref("extensions.firefoxpasswordwarning.debug", false);
pref("extensions.firefoxpasswordwarning.debug.verbose", false);
pref("extensions.firefoxpasswordwarning.usephishingwotdetection", true);
pref("extensions.firefoxpasswordwarning.usephishingsearchdetection", true);
pref("extensions.firefoxpasswordwarning.phishingsearchengine", "startpage");
pref("extensions.firefoxpasswordwarning.styleokimage", "chrome://firefoxpasswordwarningextension/skin/check/orange/o_icon1.png");
pref("extensions.firefoxpasswordwarning.styleEVimage", "chrome://firefoxpasswordwarningextension/skin/check/gruen/gr_icon1.png");
pref("extensions.firefoxpasswordwarning.firstrun", true);
pref("extensions.firefoxpasswordwarning.personalfields", false);
pref("extensions.firefoxpasswordwarning.searchfields", false);
pref("extensions.firefoxpasswordwarning.paymentfields", true);
pref("extensions.firefoxpasswordwarning.passwordfields", true);
pref("extensions.firefoxpasswordwarning.isbrokensecure", true);
pref("extensions.firefoxpasswordwarning.cookieBehavior_reset", -1);
pref("extensions.firefoxpasswordwarning.lifetimePolicy_reset", -1);

// Sync add-on settings
pref("services.sync.prefs.sync.extensions.firefoxpasswordwarning.border", true);
pref("services.sync.prefs.sync.extensions.firefoxpasswordwarning.triangle", true);
pref("services.sync.prefs.sync.extensions.firefoxpasswordwarning.notbar", true);
pref("services.sync.prefs.sync.extensions.firefoxpasswordwarning.background",true);
pref("services.sync.prefs.sync.extensions.firefoxpasswordwarning.popup", true);
pref("services.sync.prefs.sync.extensions.firefoxpasswordwarning.popuponclick",true);
pref("services.sync.prefs.sync.extensions.firefoxpasswordwarning.usephishingwotdetection", true);
pref("services.sync.prefs.sync.extensions.firefoxpasswordwarning.usephishingsearchdetection", true);
pref("services.sync.prefs.sync.extensions.firefoxpasswordwarning.phishingsearchengine", true);
pref("services.sync.prefs.sync.extensions.firefoxpasswordwarning.styleokimage", true);
pref("services.sync.prefs.sync.extensions.firefoxpasswordwarning.styleEVimage", true);
pref("services.sync.prefs.sync.extensions.firefoxpasswordwarning.firstrun", true);
pref("services.sync.prefs.sync.extensions.firefoxpasswordwarning.personalfields", true);
pref("services.sync.prefs.sync.extensions.firefoxpasswordwarning.searchfields", true);
pref("services.sync.prefs.sync.extensions.firefoxpasswordwarning.paymentfields", true);
pref("services.sync.prefs.sync.extensions.firefoxpasswordwarning.passwordfields", true);
pref("services.sync.prefs.sync.extensions.firefoxpasswordwarning.isbrokensecure", true);
pref("services.sync.prefs.sync.extensions.firefoxpasswordwarning.cookieBehavior_backup", true);
pref("services.sync.prefs.sync.extensions.firefoxpasswordwarning.lifetimePolicy_backup", true);
